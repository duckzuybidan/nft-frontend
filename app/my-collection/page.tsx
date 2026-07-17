"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CollectionView } from "@/components/my-collection/collection-view";
import { syncOwnershipApi } from "@/apis/auth";
import { useAuth } from "@/hooks/auth-hook";

export default function MyCollectionPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const syncedRef = useRef(false);

  // One sync per session visit — pulls ERC-721 / ERC-1155 into the library.
  useEffect(() => {
    if (!token || syncedRef.current) return;
    syncedRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        await syncOwnershipApi();
        if (!cancelled) {
          await queryClient.invalidateQueries({ queryKey: ["my-files"] });
        }
      } catch {
        // Non-fatal — collection still loads from DB grants.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, queryClient]);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Collection</h1>
        <p className="text-muted-foreground">
          Owned content (ERC-721) and licensed copies (ERC-1155) — separately.
        </p>
      </div>

      <CollectionView />
    </div>
  );
}
