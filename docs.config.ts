export const docsConfig = {
  contentRoot: "content/docs/it",
  appRoot: "src/app",
  routeAllowlist: [
    {
      pattern: "/api/**",
      reason: "Gli endpoint API non sono pagine di navigazione utente.",
    },
    {
      pattern: "/auth/callback",
      reason: "Callback tecnica del flusso di autenticazione.",
    },
  ],
};
