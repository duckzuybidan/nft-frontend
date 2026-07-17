"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { useAuth } from "@/hooks/auth-hook";
import { UserMenu } from "./user-menu";
import { PreferencesMenu } from "./preferences-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-provider";
import type { MessageKey } from "@/lib/i18n/messages";

const NAV_KEYS: { href: string; labelKey: MessageKey }[] = [
  { href: "/market", labelKey: "navMarketplace" },
  { href: "/market/copies", labelKey: "navBuyCopies" },
  { href: "/collections", labelKey: "navCollections" },
  { href: "/my-listings", labelKey: "navMyListings" },
  { href: "/my-collection", labelKey: "navLibrary" },
];

export default function Header() {
  const { token: accessToken } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const nav = useMemo(
    () => NAV_KEYS.map((item) => ({ ...item, label: t(item.labelKey) })),
    [t],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable
      )
        return;
      e.preventDefault();
      const input = document.querySelector<HTMLInputElement>(
        'header input[type="search"]',
      );
      input?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setMobileOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "border-border/80 bg-background/85 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          : "border-transparent bg-background/70 backdrop-blur-md",
      )}
    >
      <div className="container mx-auto flex h-[4.25rem] items-center gap-3 px-4 md:gap-5">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          aria-label={t("brandName")}
        >
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_-6px_var(--glow)] transition group-hover:scale-[1.03]">
            <span className="font-display text-sm font-black tracking-tight">
              N
            </span>
          </div>
          <div className="hidden leading-tight sm:block">
            <span className="font-display block text-[15px] font-semibold tracking-tight">
              {t("brandName")}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t("brandTagline")}
            </span>
          </div>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 xl:flex">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form
          onSubmit={onSearch}
          className="relative mx-auto hidden min-w-0 flex-1 md:block md:max-w-md lg:max-w-lg"
        >
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-11 w-full rounded-full border border-border/80 bg-muted/60 pl-10 pr-14 text-sm outline-none transition placeholder:text-muted-foreground/80 hover:bg-muted focus:border-primary/40 focus:bg-card focus:ring-2 focus:ring-primary/20"
            aria-label={t("searchAria")}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">
            /
          </kbd>
        </form>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <PreferencesMenu />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={t("openSearch")}
            onClick={() => setMobileOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="xl:hidden"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
          {accessToken && <UserMenu />}
          <div className="scale-95 origin-right sm:scale-100">
            <ConnectButton showBalance={true} chainStatus="icon" />
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/80 bg-background/95 px-4 py-4 backdrop-blur-xl xl:hidden">
          <form onSubmit={onSearch} className="relative mb-4 md:hidden">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-11 w-full rounded-full border border-border bg-muted/60 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </form>
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/leak-check"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {t("navLeakCheck")}
            </Link>
            <Link
              href="/upload"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10"
            >
              {t("navUpload")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
