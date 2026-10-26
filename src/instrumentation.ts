/**
 * Next.js instrumentation: codice eseguito all'avvio del server, PRIMA che
 * accetti richieste. Qui scaldiamo la cache JWKS usata da `getAuthUser`
 * per verificare i token ES256 (JWT signing keys di Supabase): la verifica
 * è sincrona e non può attendere il fetch, quindi senza warmup le prime
 * richieste di un'istanza fresca cadrebbero su 401.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureJwksReady } = await import("./lib/server/auth");
    await ensureJwksReady();
  }
}
