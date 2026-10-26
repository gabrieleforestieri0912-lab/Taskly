import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { SUPABASE_URL } from "./supabase";

// Secret resolution is lazy so route modules can be imported at build time:
// next build evaluates route handlers with NODE_ENV=production, where a
// missing variable would otherwise throw at import instead of at runtime.
export function getJwtSecret(): string {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_JWT_SECRET must be set in production");
  }
  return secret || "dev-only-secret-change-me";
}

// Constant used by tests to sign tokens — always matches what verifyToken
// will use for symmetric tokens (getJwtSecret returns the same value unless
// the env changes).
export const JWT_SECRET =
  process.env.SUPABASE_JWT_SECRET || "dev-only-secret-change-me";

export interface AuthUser {
  id: string;
  email?: string;
}

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
}

export function getBearerToken(request: NextRequest): string | null {
  return (
    request.headers.get("Authorization")?.replace("Bearer ", "") ||
    request.cookies.get("token")?.value ||
    null
  );
}

// ---------------------------------------------------------------------------
// JWKS verification for Supabase JWT signing keys (asymmetric tokens).
// Supabase ha migrato i progetti alle JWT signing keys: i token di sessione
// sono firmati con ES256 (kid 4346b7ef-..., unica chiave nel JWKS del
// progetto). La vecchia verifica HS256 con SUPABASE_JWT_SECRET rifiutava
// questi token ("invalid algorithm") con 401 su ogni route autenticata e il
// banner "Salvataggio non riuscito" a ogni flush di pagine (delete inclusi).
//
// getAuthUser DEVE restare sincrono (60+ route lo chiamano come valore, non
// come Promise). Quindi la verifica ES256 è sincrona: `crypto.createPublicKey`
// importa la JWK del JWKS (cache in memoria, TTL 1h, refetch on-miss per
// rotation) e `jwt.verify` valida firma + expiry sul PEM derivato. Al cold
// start il cache è scaldato all'avvio via instrumentation.ts (globalThis
// condiviso con i bundle route): le richieste successive verificano in linea,
// senza attese né doppie letture.
// ---------------------------------------------------------------------------

import { createPublicKey } from "crypto";

interface JsonWebKeyWithKid {
  kid: string;
  kty: string;
  alg?: string;
  crv?: string;
  n?: string;
  e?: string;
  x?: string;
  y?: string;
  use?: string;
  key_ops?: string[];
}

interface CachedJwks {
  fetchedAt: number;
  // Copia raw dei JWK per audit/manual debugging; l'uso pratico è la mappa
  // `keys` (kid → chiave pubblica derivate) già pronta per jwt.verify.
  rawKeys: JsonWebKeyWithKid[];
  keys: Map<string, ReturnType<typeof createPublicKey>>; // kid → public key
}

const JWKS_TTL_MS = 60 * 60 * 1000; // 1h; on kid-miss we refetch immediately

// La cache vive su globalThis: instrumentation.ts e i bundle delle route sono
// moduli SEPARATI nel build Next (istanze diverse di auth.ts), quindi il
// module-level cache non sarebbe condiviso. Il warmup fatto in register()
// all'avvio serve le route solo se entrambi leggono lo stesso globalThis.
const JWKS_GLOBAL_KEY = "__tasklySupabaseJwksCache" as const;
interface JwksGlobalHolder {
  [JWKS_GLOBAL_KEY]?: CachedJwks | null;
}
const globalHolder = globalThis as typeof globalThis & JwksGlobalHolder;

let jwksInFlight: Promise<CachedJwks> | null = null;
let jwksWarmupStarted = false;

function jwkToPublicKey(jwk: JsonWebKeyWithKid) {
  // createPublicKey accetta JWK sincronamente; i metadati non chiave
  // (kid/use/key_ops/alg) non fanno parte del materiale: si passa solo kty/crv/x/y/n/e.
  return createPublicKey({
    key: {
      kty: jwk.kty,
      ...(jwk.crv ? { crv: jwk.crv } : {}),
      ...(jwk.x ? { x: jwk.x } : {}),
      ...(jwk.y ? { y: jwk.y } : {}),
      ...(jwk.n ? { n: jwk.n } : {}),
      ...(jwk.e ? { e: jwk.e } : {}),
    },
    format: "jwk",
  });
}

async function loadJwks(): Promise<CachedJwks> {
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL not set: cannot fetch JWKS");
  }
  const res = await fetch(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
  if (!res.ok) {
    throw new Error(`JWKS fetch failed with status ${res.status}`);
  }
  const data = (await res.json()) as { keys?: JsonWebKeyWithKid[] };
  if (!Array.isArray(data.keys) || data.keys.length === 0) {
    throw new Error("JWKS payload has no keys");
  }
  const keys = new Map<string, ReturnType<typeof createPublicKey>>();
  for (const jwk of data.keys) {
    if (jwk.kid) {
      try {
        keys.set(jwk.kid, jwkToPublicKey(jwk));
      } catch {
        // Chiave non importabile (es. set di valori inattesi): si salta,
        // le altre del set restano valide.
      }
    }
  }
  return { fetchedAt: Date.now(), rawKeys: data.keys, keys };
}

function getJwksCache(): CachedJwks | null {
  const cached = globalHolder[JWKS_GLOBAL_KEY];
  if (cached && Date.now() - cached.fetchedAt < JWKS_TTL_MS) {
    return cached;
  }
  // Cache scaduta o assente: ricaric in background per le richieste successive
  // (la verifica sincrona non può attendere il fetch in corso).
  if (!jwksInFlight) {
    jwksInFlight = loadJwks()
      .then((loaded) => {
        globalHolder[JWKS_GLOBAL_KEY] = loaded;
        return loaded;
      })
      .finally(() => {
        jwksInFlight = null;
      });
  }
  return null;
}

/**
 * Carica il JWKS e attende il completamento: chiamato da instrumentation.ts
 * all'avvio del server (register() completa prima che il server accetti
 * richieste), così anche la primissima richiesta di un'istanza fresca trova
 * la cache pronta. Errori non fatali: la verifica sincrona ricarica lazy.
 */
export async function ensureJwksReady(): Promise<void> {
  try {
    await getJwksCache();
  } catch (e) {
    console.warn(
      "[auth] JWKS warmup fallito (la verifica farà lazy-fetch):",
      e instanceof Error ? e.message : e,
    );
  }
}

// Warmup di primo avvio: il modulo viene importato al primo handle di una
// route autenticata, così il cache è pronto per la richiesta successiva.
function warmJwks() {
  if (jwksWarmupStarted) return;
  jwksWarmupStarted = true;
  getJwksCache();
}

function decodeTokenHeader(token: string): { alg?: string; kid?: string } {
  const headerPart = token.split(".")[0];
  if (!headerPart) throw new Error("Malformed token (missing header)");
  const json = Buffer.from(headerPart, "base64url").toString("utf8");
  return JSON.parse(json);
}

function verifyWithJwks(
  token: string,
  header: { alg?: string; kid?: string },
): JwtPayload | string {
  let cache = getJwksCache();
  if (!cache) throw new Error("JWKS cache not ready yet (cold start)");

  let key = header.kid ? cache.keys.get(header.kid) : undefined;
  if (!key && header.kid) {
    // Possibile chiave ruotata su Supabase: cache inutilizzabile per questa
    // richiesta (la verifica è sincrona), ma ricarico in background così le
    // richieste successive usano il nuovo set.
    globalHolder[JWKS_GLOBAL_KEY] = null;
    warmJwks();
  }
  if (!key) {
    throw new Error(`No JWKS key for kid ${header.kid ?? "(none)"}`);
  }

  const decoded = jwt.verify(token, key, {
    algorithms: header.alg === "RS256" ? ["RS256"] : ["ES256"],
  });
  return decoded as JwtPayload | string;
}

/**
 * Verifies a Supabase Auth access token (synchronous, for the API routes).
 * Vedi blocco JWKS sopra: HS256 → legacy secret, ES256/RS256 → JWKS Supabase.
 * Claims: sub = user UUID, email, role.
 */
export function verifyToken(token: string): JwtPayload | string {
  const header = decodeTokenHeader(token);
  if (header.alg && header.alg !== "HS256") {
    warmJwks();
    return verifyWithJwks(token, header);
  }
  return jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  }) as JwtPayload | string;
}

/**
 * Next.js replacement for the Express `authRequired` / `authOptional`
 * middlewares. Returns the authenticated user or null; the route handler
 * decides whether null means 401 (required) or anonymous access (optional).
 */
export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = getBearerToken(request);
  if (!token) return null;
  warmJwks();
  try {
    const decoded = verifyToken(token);
    const payload =
      typeof decoded === "string"
        ? ({ sub: decoded } as JwtPayload)
        : (decoded as JwtPayload);
    if (!payload || !payload.sub) return null;
    return { id: payload.sub as string, email: payload.email };
  } catch {
    return null;
  }
}
