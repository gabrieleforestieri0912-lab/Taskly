"use client";

/**
 * Icona app di Google Calendar (stile 2020): squircle blu sfumato con
 * "31" bianco al centro, foglio azzurro che spunta sopra il tile e
 * linguetta centrale appesa al suo bordo. I glifi "3" e "1" sono quelli
 * del logo ufficiale 2020 (Wikimedia Commons, trademark di Google LLC),
 * resi bianchi come nell'icona app.
 *
 * I path sono stringhe MONO-RIGA: stringhe multilinea nell'attributo JSX
 * causano un hydration mismatch (newline/tab normalizzati diversamente da
 * server e client). Path data: i newline sono solo separatori whitespace.
 */
/** Glifi "3" e "1" del logo ufficiale (riempiti di bianco dall'utente del componente). */
const DIGIT_PATHS: readonly string[] = [
  "M65.211,125.276c-3.934-2.658-6.658-6.539-8.145-11.671l9.132-3.763c0.829,3.158,2.276,5.605,4.342,7.342 c2.053,1.737,4.553,2.592,7.474,2.592c2.987,0,5.553-0.908,7.697-2.724s3.224-4.132,3.224-6.934c0-2.868-1.132-5.211-3.395-7.026 s-5.105-2.724-8.5-2.724h-5.276v-9.039H76.5c2.921,0,5.382-0.789,7.382-2.368c2-1.579,3-3.737,3-6.487 c0-2.447-0.895-4.395-2.684-5.855s-4.053-2.197-6.803-2.197c-2.684,0-4.816,0.711-6.395,2.145s-2.724,3.197-3.447,5.276 l-9.039-3.763c1.197-3.395,3.395-6.395,6.618-8.987c3.224-2.592,7.342-3.895,12.342-3.895c3.697,0,7.026,0.711,9.974,2.145 c2.947,1.434,5.263,3.421,6.934,5.947c1.671,2.539,2.5,5.382,2.5,8.539c0,3.224-0.776,5.947-2.329,8.184 c-1.553,2.237-3.461,3.947-5.724,5.145v0.539c2.987,1.25,5.421,3.158,7.342,5.724c1.908,2.566,2.868,5.632,2.868,9.211 s-0.908,6.776-2.724,9.579c-1.816,2.803-4.329,5.013-7.513,6.618c-3.197,1.605-6.789,2.421-10.776,2.421 C73.408,129.263,69.145,127.934,65.211,125.276z",
  "M121.25,79.961l-9.974,7.25l-5.013-7.605l17.987-12.974h6.895v61.197h-9.895L121.25,79.961z",
];

export default function GoogleCalendarIcon({
  className = "w-5 h-5",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="gcal-app-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5E97F7" />
          <stop offset="1" stopColor="#2F6BE4" />
        </linearGradient>
      </defs>
      {/* Foglio azzurro che spunta sopra il tile */}
      <rect x="32" y="10" width="136" height="150" rx="20" fill="#A8C7FA" />
      {/* Tile principale */}
      <rect x="14" y="22" width="172" height="172" rx="38" fill="url(#gcal-app-bg)" />
      {/* Linguetta centrale, fuse col foglio, che pende sopra il tile */}
      <path fill="#A8C7FA" d="M72,10h56v24c0,6.6-5.4,12-12,12H84c-6.6,0-12-5.4-12-12V10z" />
      {/* 31 bianco centrato sul tile */}
      <g transform="translate(2.8 19)" fill="#FFFFFF">
        {DIGIT_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
