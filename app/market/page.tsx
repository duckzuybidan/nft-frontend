"use client";

import { MarketList } from "@/components/market/market-list";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale-provider";

export default function MarketPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-[70vh]">
      <div className="border-b border-border/60 section-band">
        <div className="container mx-auto px-4 py-10 md:px-6 md:py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                <ShoppingBag className="h-3.5 w-3.5" />
                {t("primaryMarket")}
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                {t("marketplace")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                {t("marketplaceDesc")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/market/copies">{t("secondaryCopies")}</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/upload">{t("listContent")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:px-6 md:py-10">
        <MarketList />
      </div>
    </div>
  );
}
