"use client";

import { CollectionView } from "@/components/my-collection/collection-view";

export default function MyCollectionPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Collection</h1>
        <p className="text-muted-foreground">
          Manage and view all your uploaded files and NFTs
        </p>
      </div>

      <CollectionView />
    </div>
  );
}
