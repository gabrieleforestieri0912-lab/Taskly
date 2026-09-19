"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Container } from "./Container";
import { landingContent } from "@/content/landing";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { logo, links, ctaLogin, ctaPrimary } = landingContent.nav;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-black/40">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          {logo}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigazione principale">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] rounded"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium hover:bg-muted"
          >
            {ctaLogin}
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-[#7b39fc] px-4 text-sm font-medium text-white hover:bg-[#6d28d9]"
          >
            {ctaPrimary}
          </Link>
        </div>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
            aria-label="Apri menu"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-white dark:bg-[#0a0a0a]">
            <SheetHeader>
              <SheetTitle>{logo}</SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-4" aria-label="Menu mobile">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium py-2 border-b border-gray-100 dark:border-white/10"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium"
                >
                  {ctaLogin}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-[#7b39fc] px-4 text-sm font-medium text-white hover:bg-[#6d28d9]"
                >
                  {ctaPrimary}
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
