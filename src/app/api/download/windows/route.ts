import { NextResponse } from "next/server";
import { GITHUB_REPO, windowsAssetName } from "@/lib/apps";

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface ReleaseInfo {
  tag_name: string;
  assets?: ReleaseAsset[];
}

/**
 * GET /api/download/windows → 302 all'installer .exe dell'ultima release.
 * Risolve il nome reale via GitHub API così l'URL resta stabile al cambio
 * versione. Senza release pubblicata risponde 404 con messaggio chiaro.
 */
export async function GET() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      { headers: { Accept: "application/vnd.github+json" }, next: { revalidate: 3600 } },
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Installer Windows non ancora pubblicato. Torna a trovarci tra poco." },
        { status: 404 },
      );
    }
    const release = (await res.json()) as ReleaseInfo;
    const assets = Array.isArray(release.assets) ? release.assets : [];
    const exe =
      assets.find((a) => a.name === windowsAssetName()) ||
      assets.find((a) => a.name.toLowerCase().endsWith(".exe"));
    if (!exe) {
      return NextResponse.json(
        { error: "Installer Windows non trovato nell'ultima release." },
        { status: 404 },
      );
    }
    return NextResponse.redirect(exe.browser_download_url, 302);
  } catch {
    return NextResponse.json(
      { error: "Download non disponibile al momento. Riprova più tardi." },
      { status: 502 },
    );
  }
}
