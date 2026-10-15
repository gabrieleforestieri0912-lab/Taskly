/** Link e metadati delle app Taskly (desktop + mobile). */

export const GITHUB_REPO = "gabrieleforestieri0912-lab/Taskly";

export const DESKTOP_VERSION = "0.1.0";

/** Nome artefatto NSIS prodotto da electron-builder (artifactName in desktop/package.json). */
export function windowsAssetName(version: string = DESKTOP_VERSION): string {
  return `Taskly-Setup-${version}.exe`;
}

/** URL diretto all'installer Windows dell'ultima release GitHub. */
export function windowsDownloadUrl(version: string = DESKTOP_VERSION): string {
  return `https://github.com/${GITHUB_REPO}/releases/latest/download/${windowsAssetName(version)}`;
}

export const DESKTOP_REQUIREMENTS = [
  "Windows 10 o superiore (64 bit)",
  "4 GB di RAM consigliati",
  "200 MB di spazio libero",
  "Connessione internet per la sincronizzazione",
] as const;
