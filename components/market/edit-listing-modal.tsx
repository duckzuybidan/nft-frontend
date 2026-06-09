"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMarket } from "@/hooks/market-hook";
import { Loader2 } from "lucide-react";
import { ListingResponse } from "@/apis/market";

interface EditListingModalProps {
  listing: ListingResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditListingModal({
  listing,
  isOpen,
  onClose,
}: EditListingModalProps) {
  const { updateListing, isUpdating } = useMarket();
  const [buyPrice, setBuyPrice] = useState("");
  const [hirePrice, setHirePrice] = useState("");
  const [tokenId, setTokenId] = useState("");

  useEffect(() => {
    if (listing) {
      setBuyPrice(listing.buyPrice || "");
      setHirePrice(listing.hirePrice || "");
      setTokenId(listing.tokenId || "");
    }
  }, [listing]);

  const handleUpdate = async () => {
    if (!listing) return;
    if (!buyPrice && !hirePrice) {
      return;
    }

    try {
      await updateListing({
        listingId: listing.id,
        data: {
          buyPrice: buyPrice || undefined,
          hirePrice: hirePrice || undefined,
          tokenId: tokenId || undefined,
        },
      });
      onClose();
    } catch (error) {
      console.error("Failed to update listing", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
          <DialogDescription>
            Update your prices for "{listing?.file.metadata.fileName}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-buyPrice">Sale Price (ETH)</Label>
            <Input
              id="edit-buyPrice"
              type="number"
              step="0.001"
              placeholder="e.g. 0.05"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-hirePrice">Hire Price (ETH / day)</Label>
            <Input
              id="edit-hirePrice"
              type="number"
              step="0.001"
              placeholder="e.g. 0.005"
              value={hirePrice}
              onChange={(e) => setHirePrice(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-tokenId">Token ID (Optional)</Label>
            <Input
              id="edit-tokenId"
              placeholder="NFT Token ID"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating || (!buyPrice && !hirePrice)}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Listing"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
