"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-provider";

export function SiteFooter() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr] md:py-12">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
              N
            </div>
            <span className="font-display text-base font-semibold">
              {t("brandName")}
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {t("footerTagline")}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("marketplace")}
          </p>
          <nav className="mt-3 flex flex-col gap-2 text-sm">
            <Link
              href="/market"
              className="text-muted-foreground transition hover:text-foreground"
            >
              {t("navMarketplace")}
            </Link>
            <Link
              href="/market/copies"
              className="text-muted-foreground transition hover:text-foreground"
            >
              {t("navBuyCopies")}
            </Link>
            <Link
              href="/collections"
              className="text-muted-foreground transition hover:text-foreground"
            >
              {t("navCollections")}
            </Link>
          </nav>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("discover")}
          </p>
          <nav className="mt-3 flex flex-col gap-2 text-sm">
            <Link
              href="/upload"
              className="text-muted-foreground transition hover:text-foreground"
            >
              {t("upload")}
            </Link>
            <Link
              href="/my-collection"
              className="text-muted-foreground transition hover:text-foreground"
            >
              {t("navLibrary")}
            </Link>
            <Link
              href="/search"
              className="text-muted-foreground transition hover:text-foreground"
            >
              {t("search")}
            </Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground">
          <span>
            © {year} {t("brandName")}. {t("footerRights")}
          </span>
          <span className="tabular-nums">ERC-721 · ERC-1155</span>
        </div>
      </div>
    </footer>
  );
}
