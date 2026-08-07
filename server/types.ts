// Shared type augmentations for the Express API server.
// Keeps `req.userId` / `req.user` / `socket.user` typed without touching
// every route. Imported (for side effects) by server/index.ts.

export {};

declare global {
  namespace Express {
    interface Request {
      userId?: string | null;
      user?: { id: string; email?: string } | null;
    }
  }
}
