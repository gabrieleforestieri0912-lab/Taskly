"use client";

import { BrowserRouter } from "react-router-dom";

export function ClientRouter({ children }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}