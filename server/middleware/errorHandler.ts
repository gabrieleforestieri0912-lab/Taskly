import type { Request, Response, NextFunction } from "express";

interface ApiError extends Error {
  status?: number;
  code?: string;
}

const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(`[Error] ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: {
      message,
      status,
      code: err.code || "INTERNAL_ERROR",
    },
  });
};

export default errorHandler;
