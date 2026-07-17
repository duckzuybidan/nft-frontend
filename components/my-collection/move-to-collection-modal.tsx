"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  getMyCollectionsApi,
  moveFileToCollectionApi,
  type CollectionType,
} from "@/apis/collection";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function MoveToCollectionModal({
  fileId,
  fileName,
  isOpen,
  onClose,
}: {
  fileId: string | null;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [collectionId, setCollectionId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getMyCollectionsApi()
      .then(setCollections)
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const submit = async () => {
    if (!fileId) return;
    setSaving(true);
    try {
      await moveFileToCollectionApi(fileId, collectionId || null);
      toast.success(
        collectionId ? "Moved to collection" : "Removed from collection",
      );
      await queryClient.invalidateQueries({ queryKey: ["my-files"] });
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to move NFT",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move “{fileName}”</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <label className="text-sm font-medium">Collection</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            disabled={loading}
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
          >
            <option value="">No collection</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
