"use client";

import { useEffect, useState } from "react";
import api from "@/apis/api-config";
import { listCollectionsApi } from "@/apis/collection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminHomepagePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [heroIds, setHeroIds] = useState<string[]>([]);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [maxItems, setMaxItems] = useState(8);

  useEffect(() => {
    (async () => {
      try {
        const [cfg, cols] = await Promise.all([
          api.get("/admin/homepage").then((r) => r.data),
          listCollectionsApi({ limit: 50 }),
        ]);
        setCollections(cols.data || []);
        setHeroIds(cfg.heroCollectionIds || []);
        setFeaturedIds(cfg.featuredCollectionIds || []);
        setMaxItems(cfg.maxItemsPerSection || 8);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            "Admin only — set User.role to admin in the database",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (
    id: string,
    list: string[],
    setList: (v: string[]) => void,
  ) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/homepage", {
        heroCollectionIds: heroIds,
        featuredCollectionIds: featuredIds,
        maxItemsPerSection: maxItems,
      });
      toast.success("Homepage config saved");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Homepage config</h1>
        <p className="text-muted-foreground">
          Curate hero / featured collections. Requires{' '}
          <code className="text-xs">User.role = admin</code>.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Hero collections</h2>
        {collections.map((c) => (
          <label key={`h-${c.id}`} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={heroIds.includes(c.id)}
              onChange={() => toggle(c.id, heroIds, setHeroIds)}
            />
            {c.name}
          </label>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Featured collections</h2>
        {collections.map((c) => (
          <label key={`f-${c.id}`} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featuredIds.includes(c.id)}
              onChange={() => toggle(c.id, featuredIds, setFeaturedIds)}
            />
            {c.name}
          </label>
        ))}
      </section>

      <section>
        <label className="text-sm font-medium">Max items per section</label>
        <input
          type="number"
          min={1}
          className="mt-1 flex h-10 w-40 rounded-md border px-3 text-sm"
          value={maxItems}
          onChange={(e) => setMaxItems(Number(e.target.value) || 8)}
        />
      </section>

      <Button onClick={save} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
      </Button>
    </div>
  );
}
