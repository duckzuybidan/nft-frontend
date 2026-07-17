"use client";

import { use, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import Link from "next/link";
import {
  getCollectionBySlugApi,
  getCollectionItemsApi,
  updateCollectionApi,
  requestJoinCollectionApi,
  inviteCollectionMemberApi,
  listCollectionMembersApi,
  updateCollectionMemberApi,
  removeCollectionMemberApi,
  type CollectionMember,
} from "@/apis/collection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth-hook";

const CATEGORIES = [
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

export default function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { address } = useAccount();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inviteWallet, setInviteWallet] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    logoUrl: "",
    bannerUrl: "",
    category: "Collectibles",
    website: "",
    twitter: "",
    discord: "",
  });

  const { data: collection, isLoading } = useQuery({
    queryKey: ["collection", slug],
    queryFn: () => getCollectionBySlugApi(slug),
  });

  const { data: items } = useQuery({
    queryKey: ["collection-items", slug],
    queryFn: () => getCollectionItemsApi(slug, 1, 24),
    enabled: Boolean(slug),
  });

  const isOwner = collection?.membershipRole === "owner";

  const { data: members = [], refetch: refetchMembers } = useQuery({
    queryKey: ["collection-members", collection?.id],
    queryFn: () => listCollectionMembersApi(collection!.id),
    enabled: Boolean(isOwner && collection?.id && token),
  });

  useEffect(() => {
    if (!collection) return;
    setForm({
      name: collection.name || "",
      description: collection.description || "",
      logoUrl: collection.logoUrl || "",
      bannerUrl: collection.bannerUrl || "",
      category: collection.category || "Collectibles",
      website: collection.website || "",
      twitter: collection.twitter || "",
      discord: collection.discord || "",
    });
  }, [collection]);

  const saveEdit = async () => {
    if (!collection) return;
    setSaving(true);
    try {
      const updated = await updateCollectionApi(collection.id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        logoUrl: form.logoUrl.trim() || undefined,
        bannerUrl: form.bannerUrl.trim() || undefined,
        category: form.category,
        website: form.website.trim() || undefined,
        twitter: form.twitter.trim() || undefined,
        discord: form.discord.trim() || undefined,
      });
      toast.success("Collection updated");
      setEditing(false);
      await queryClient.invalidateQueries({ queryKey: ["collection", slug] });
      if (updated.slug && updated.slug !== slug) {
        window.location.href = `/collections/${updated.slug}`;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const requestJoin = async () => {
    if (!collection) return;
    try {
      await requestJoinCollectionApi(collection.id);
      toast.success("Join request sent — wait for owner approval");
      await queryClient.invalidateQueries({ queryKey: ["collection", slug] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Request failed");
    }
  };

  const invite = async () => {
    if (!collection || !inviteWallet.trim()) return;
    try {
      await inviteCollectionMemberApi(collection.id, inviteWallet.trim());
      toast.success("Contributor approved");
      setInviteWallet("");
      await refetchMembers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Invite failed");
    }
  };

  const setMemberStatus = async (
    member: CollectionMember,
    status: "approved" | "rejected",
  ) => {
    try {
      await updateCollectionMemberApi(member.id, status);
      toast.success(status === "approved" ? "Approved" : "Rejected");
      await refetchMembers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  const removeMember = async (member: CollectionMember) => {
    try {
      await removeCollectionMemberApi(member.id);
      toast.success("Removed");
      await refetchMembers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Remove failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Collection not found</h1>
        <Button asChild className="mt-4">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="relative h-52 overflow-hidden bg-muted md:h-72">
        {(collection.bannerUrl || collection.logoUrl) ? (
          <img
            src={collection.bannerUrl || collection.logoUrl || ""}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-muted to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>
      <div className="container mx-auto -mt-16 px-4 md:-mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4">
            {collection.logoUrl ? (
              <img
                src={collection.logoUrl}
                alt=""
                className="h-24 w-24 rounded-2xl border-4 border-background object-cover shadow-xl md:h-28 md:w-28"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-background bg-primary/15 font-display text-2xl font-bold text-primary shadow-xl md:h-28 md:w-28">
                {collection.name?.slice(0, 1) || "C"}
              </div>
            )}
            <div className="pb-1">
              <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                {collection.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {collection.category} · by{" "}
                {collection.creator?.walletAddress?.slice(0, 8)}…
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pb-1">
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? "Cancel edit" : "Manage"}
              </Button>
            )}
            {token &&
              address &&
              !isOwner &&
              collection.membershipRole !== "contributor" &&
              collection.membershipRole !== "pending" && (
                <Button size="sm" className="rounded-full" onClick={requestJoin}>
                  Request to add NFTs
                </Button>
              )}
            {collection.membershipRole === "pending" && (
              <Button size="sm" variant="secondary" className="rounded-full" disabled>
                Join pending
              </Button>
            )}
            {collection.membershipRole === "contributor" && (
              <Button size="sm" variant="secondary" className="rounded-full" disabled>
                Approved contributor
              </Button>
            )}
          </div>
        </div>

        {editing && isOwner ? (
          <div className="surface-card mt-6 max-w-xl space-y-3 p-5">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Thumbnail (logo URL)</label>
              <Input
                placeholder="https://…"
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Banner URL</label>
              <Input
                placeholder="https://…"
                value={form.bannerUrl}
                onChange={(e) =>
                  setForm({ ...form, bannerUrl: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Twitter</label>
                <Input
                  value={form.twitter}
                  onChange={(e) =>
                    setForm({ ...form, twitter: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Discord</label>
                <Input
                  value={form.discord}
                  onChange={(e) =>
                    setForm({ ...form, discord: e.target.value })
                  }
                />
              </div>
            </div>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        ) : (
          collection.description && (
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {collection.description}
            </p>
          )
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Floor",
              value: `${collection.stats?.floorPrice ?? "—"} ETH`,
            },
            {
              label: "Volume",
              value: `${collection.stats?.totalVolume ?? 0} ETH`,
            },
            {
              label: "Items",
              value: String(collection.stats?.totalItems ?? 0),
            },
            {
              label: "Owners",
              value: String(collection.stats?.totalOwners ?? 0),
            },
          ].map((s) => (
            <div key={s.label} className="surface-card p-3.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 font-display text-base font-semibold tabular-nums">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {isOwner && (
          <div className="surface-card mt-8 max-w-xl space-y-4 p-5">
            <h2 className="font-display text-lg font-semibold">
              Approved contributors
            </h2>
            <p className="text-sm text-muted-foreground">
              Only you and approved wallets can add new NFTs to this collection.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="0x… wallet to invite"
                value={inviteWallet}
                onChange={(e) => setInviteWallet(e.target.value)}
              />
              <Button type="button" onClick={invite}>
                Approve
              </Button>
            </div>
            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="font-mono text-xs">
                    {m.user.walletAddress.slice(0, 10)}… · {m.status}
                  </span>
                  <div className="flex gap-1">
                    {m.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setMemberStatus(m, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setMemberStatus(m, "rejected")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {m.status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeMember(m)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!members.length && (
                <p className="text-sm text-muted-foreground">
                  No join requests yet.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="font-display mb-5 text-xl font-semibold tracking-tight">
            Items
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {(items?.data || []).map((file: any) => (
              <div
                key={file.id}
                className="surface-card hover-lift group overflow-hidden"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {file.metadata?.previewImage && (
                    <img
                      src={file.metadata.previewImage}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-3.5">
                  <p className="truncate text-sm font-medium">
                    {file.metadata?.fileName}
                  </p>
                  {file.listing?.isActive && (
                    <Button
                      asChild
                      size="sm"
                      className="mt-3 w-full rounded-full"
                    >
                      <Link href={`/market/${file.listing.id}`}>
                        View listing
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!(items?.data || []).length && (
              <div className="col-span-full rounded-2xl border border-dashed border-border/80 bg-muted/20 p-10 text-center text-sm text-muted-foreground">
                No items in this collection yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
