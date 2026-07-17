"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getHomepageApi } from "@/apis/homepage";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { CollectionCard } from "@/components/collection/collection-card";
import { NftTile } from "@/components/market/nft-tile";
import {
  formatCompact,
  formatEth,
  relativeTime,
  shortAddr,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-provider";
import {
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

export default function HomePage() {
  const { t } = useLocale();
  const [category, setCategory] = useState("All");
  const [heroIndex, setHeroIndex] = useState(0);
  const [weeklyTab, setWeeklyTab] = useState<"erc721" | "erc1155">("erc721");

  const { data, isLoading } = useQuery({
    queryKey: ["homepage", category],
    queryFn: () => getHomepageApi(category),
  });

  const hero = data?.hero || [];
  const categories: string[] = data?.categories || [
    "All",
    "Art",
    "Music",
    "Photography",
    "Video",
    "Documents",
    "Gaming",
    "AI",
    "3D",
    "Collectibles",
  ];

  useEffect(() => {
    if (hero.length < 2) return;
    const id = setInterval(
      () => setHeroIndex((i) => (i + 1) % hero.length),
      7000,
    );
    return () => clearInterval(id);
  }, [hero.length]);

  useEffect(() => {
    setHeroIndex(0);
  }, [category]);

  const slide = hero[heroIndex];
  const weekly =
    weeklyTab === "erc721"
      ? data?.highestWeekly?.erc721 || []
      : data?.highestWeekly?.erc1155 || [];

  const stats = useMemo(() => {
    const listings = data?.recentListings || [];
    const collections =
      data?.featuredCollections || data?.trendingCollections || [];
    const activity = data?.activity || [];
    const volume = [...(data?.highestWeekly?.erc721 || []), ...(data?.highestWeekly?.erc1155 || [])]
      .slice(0, 20)
      .reduce((sum: number, s: any) => sum + (Number(s.price) || 0), 0);
    return [
      {
        label: t("weeklyVolume"),
        value: formatEth(volume, 2),
        icon: <TrendingUp className="h-4 w-4" />,
      },
      {
        label: t("collections"),
        value: formatCompact(collections.length || hero.length),
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: t("listedItems"),
        value: formatCompact(listings.length + (data?.trendingNfts || []).length),
        icon: <ShoppingBag className="h-4 w-4" />,
      },
      {
        label: t("liveEvents"),
        value: formatCompact(activity.length),
        icon: <Users className="h-4 w-4" />,
      },
    ];
  }, [data, hero.length, t]);

  const emptyHint = useMemo(
    () =>
      !isLoading &&
      !hero.length &&
      !(data?.recentListings || []).length &&
      !(data?.featuredCollections || []).length,
    [isLoading, hero.length, data],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t("loadingMarketplace")}</p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="hero-mesh relative overflow-hidden border-b border-border/60">
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-14">
          {slide ? (
            <div className="fade-in-up grid items-stretch gap-5 lg:grid-cols-[1.55fr_0.95fr]">
              <div className="group relative min-h-[320px] overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_30px_80px_-40px_rgba(0,0,0,0.7)] md:min-h-[420px]">
                {slide.bannerUrl || slide.logoUrl ? (
                  <img
                    src={slide.bannerUrl || slide.logoUrl}
                    alt={slide.name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-zinc-800 to-zinc-950" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

                <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white md:p-8">
                  <p className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {t("featuredCollection")}
                  </p>
                  <div className="mb-4 flex items-center gap-3">
                    {slide.logoUrl && (
                      <img
                        src={slide.logoUrl}
                        alt=""
                        className="h-14 w-14 rounded-full border border-white/25 object-cover shadow-lg"
                      />
                    )}
                    <div>
                      <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                        {slide.name}
                      </h1>
                      <p className="mt-1 text-sm text-white/70">
                        {t("by")} {shortAddr(slide.creator?.walletAddress)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-5 grid max-w-lg grid-cols-2 gap-2 sm:grid-cols-4">
                    <HeroStat
                      label={t("floor")}
                      value={formatEth(slide.stats?.floorPrice)}
                    />
                    <HeroStat
                      label={t("volume")}
                      value={formatEth(slide.stats?.totalVolume)}
                    />
                    <HeroStat
                      label={t("items")}
                      value={String(slide.stats?.totalItems ?? 0)}
                    />
                    <HeroStat
                      label={t("owners")}
                      value={String(slide.stats?.totalOwners ?? 0)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <Button
                      asChild
                      size="lg"
                      className="h-11 rounded-full px-5 font-semibold"
                    >
                      <Link href={`/collections/${slide.slug}`}>
                        {t("viewCollection")}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="secondary"
                      className="h-11 rounded-full border border-white/15 bg-white/10 px-5 text-white hover:bg-white/20"
                    >
                      <Link href="/market">{t("exploreMarket")}</Link>
                    </Button>
                  </div>
                </div>

                {hero.length > 1 && (
                  <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 rounded-full border border-white/15 bg-black/40 text-white backdrop-blur hover:bg-black/60"
                      onClick={() =>
                        setHeroIndex(
                          (i) =>
                            (i - 1 + hero.length) % Math.max(hero.length, 1),
                        )
                      }
                      aria-label="Previous featured"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 rounded-full border border-white/15 bg-black/40 text-white backdrop-blur hover:bg-black/60"
                      onClick={() =>
                        setHeroIndex((i) => (i + 1) % Math.max(hero.length, 1))
                      }
                      aria-label="Next featured"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div className="surface-elevated flex flex-1 flex-col justify-between p-6 md:p-7">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                      {t("brandName")}
                    </p>
                    <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                      {t("ownOriginals")}
                      <br />
                      {t("licenseCopies")}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {t("heroPitch")}
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button asChild className="rounded-full">
                      <Link href="/market">
                        {t("browseListings")}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href="/market/copies">{t("buyCopies")}</Link>
                    </Button>
                  </div>
                </div>

                {hero.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    {hero.map((_: unknown, i: number) => (
                      <button
                        key={i}
                        aria-label={`Featured slide ${i + 1}`}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          i === heroIndex
                            ? "w-8 bg-primary"
                            : "w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                        )}
                        onClick={() => setHeroIndex(i)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="surface-elevated mx-auto max-w-2xl p-10 text-center fade-in-up">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                {t("brandName")}
              </p>
              <h1 className="font-display mt-2 text-3xl font-semibold md:text-4xl">
                {t("premiumMarketplace")}
              </h1>
              <p className="mt-3 text-muted-foreground">
                {emptyHint ? t("emptyHero") : t("featuredWillAppear")}
              </p>
              <div className="mt-7 flex justify-center gap-3">
                <Button asChild className="rounded-full">
                  <Link href="/market">{t("browseMarket")}</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/upload">{t("upload")}</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border/60 bg-card/40">
        <div className="container mx-auto flex gap-2 overflow-x-auto px-4 py-4 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
                category === c
                  ? "bg-primary text-primary-foreground shadow-[0_0_24px_-8px_var(--glow)]"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border/60">
        <div className="container mx-auto grid grid-cols-2 gap-3 px-4 py-8 md:grid-cols-4 md:gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "surface-card fade-in-up flex items-start gap-3 p-4",
                `stagger-${i + 1}`,
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {s.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <p className="font-display mt-0.5 truncate text-lg font-semibold tabular-nums">
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="container mx-auto space-y-16 px-4 py-12 md:space-y-20 md:py-16">
        {/* Trending */}
        <section>
          <SectionHeader
            title={t("trendingNfts")}
            subtitle={t("trendingSubtitle")}
            href="/market"
            actionLabel={t("viewAll")}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {(data?.trendingNfts || []).map((item: any, i: number) => (
              <NftTile
                key={item.listing.id}
                href={`/market/${item.listing.id}`}
                title={item.listing.file?.metadata?.fileName || "Untitled"}
                subtitle={
                  item.listing.file?.collection?.name || "Uncategorized"
                }
                imageUrl={item.listing.file?.metadata?.previewImage}
                price={item.price}
                changePct={item.changePct}
                rank={i + 1}
              />
            ))}
            {!(data?.trendingNfts || []).length && (
              <EmptyRail text={t("emptyTrending")} />
            )}
          </div>
        </section>

        {/* Featured collections */}
        <section className="rounded-3xl border border-border/50 section-band px-4 py-8 md:px-6 md:py-10 -mx-0">
          <SectionHeader
            title={t("featuredCollections")}
            subtitle={t("featuredSubtitle")}
            href="/collections"
            actionLabel={t("viewAll")}
            icon={<Layers className="h-4 w-4" />}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.featuredCollections || data?.trendingCollections || []).map(
              (c: any) => (
                <CollectionCard key={c.id} collection={c} />
              ),
            )}
            {!(data?.featuredCollections || []).length &&
              !(data?.trendingCollections || []).length && (
                <EmptyRail text={t("emptyCollections")} />
              )}
          </div>
        </section>

        {/* Recently listed + Weekly sales side-by-side on large screens */}
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <section>
            <SectionHeader
              title={t("recentlyListed")}
              subtitle={t("recentlySubtitle")}
              href="/market"
              actionLabel={t("viewAll")}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {(data?.recentListings || []).slice(0, 6).map((listing: any) => (
                <NftTile
                  key={listing.id}
                  href={`/market/${listing.id}`}
                  title={listing.file?.metadata?.fileName || "Untitled"}
                  subtitle={listing.file?.collection?.name}
                  imageUrl={listing.file?.metadata?.previewImage}
                  price={listing.buyPrice ?? listing.copyPrice}
                  badge={listing.buyPrice ? t("content") : t("copy")}
                />
              ))}
              {!(data?.recentListings || []).length && (
                <EmptyRail text={t("emptyRecent")} />
              )}
            </div>
          </section>

          <section>
            <SectionHeader
              title={t("highestWeekly")}
              subtitle={t("highestWeeklySubtitle")}
            />
            <div className="mb-4 flex gap-2">
              <TabChip
                active={weeklyTab === "erc721"}
                onClick={() => setWeeklyTab("erc721")}
              >
                {t("erc721Content")}
              </TabChip>
              <TabChip
                active={weeklyTab === "erc1155"}
                onClick={() => setWeeklyTab("erc1155")}
              >
                {t("erc1155Copies")}
              </TabChip>
            </div>
            <div className="surface-card divide-y divide-border/70 overflow-hidden">
              {weekly.map((sale: any, i: number) => (
                <div
                  key={sale.id}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-3.5 transition hover:bg-muted/40",
                    i === 0 && "bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {sale.file?.metadata?.previewImage && (
                      <img
                        src={sale.file.metadata.previewImage}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {sale.file?.metadata?.fileName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {sale.file?.collection?.name || "—"} ·{" "}
                      {shortAddr(sale.seller?.walletAddress)} →{" "}
                      {shortAddr(sale.buyer?.walletAddress)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatEth(sale.price)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {weeklyTab === "erc721" ? t("content") : t("copy")}
                    </p>
                  </div>
                </div>
              ))}
              {!weekly.length && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {t("emptyWeekly")}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Live activity */}
        <section>
          <SectionHeader
            title={t("liveActivity")}
            subtitle={t("liveActivitySubtitle")}
            icon={<Activity className="h-4 w-4" />}
          />
          <div className="surface-card overflow-hidden">
            {(data?.activity || []).slice(0, 10).map((ev: any, i: number) => (
              <div
                key={`${ev.kind}-${ev.at}-${i}`}
                className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5 last:border-0 hover:bg-muted/30"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    String(ev.kind).includes("buy") ||
                      String(ev.kind).includes("purchase")
                      ? "bg-success/15 text-success"
                      : "bg-primary/15 text-primary",
                  )}
                >
                  {String(ev.kind).includes("buy") ||
                  String(ev.kind).includes("purchase")
                    ? "↗"
                    : "＋"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {ev.title || "Item"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="capitalize">
                      {String(ev.kind).replaceAll("_", " ")}
                    </span>
                    {" · "}
                    {shortAddr(ev.seller)}
                    {ev.buyer ? ` → ${shortAddr(ev.buyer)}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatEth(ev.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {relativeTime(ev.at)}
                  </p>
                </div>
              </div>
            ))}
            {!(data?.activity || []).length && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {t("emptyActivity")}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 backdrop-blur-md">
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/55">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

function TabChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function EmptyRail({ text }: { text: string }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-border/80 bg-muted/20 p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
