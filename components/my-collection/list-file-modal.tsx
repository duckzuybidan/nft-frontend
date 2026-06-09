"use client";

import { useState } from "react";
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

interface ListFileModalProps {
  fileId: string | null;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ListFileModal({
  fileId,
  fileName,
  isOpen,
  onClose,
}: ListFileModalProps) {
  const { listFile, isListing } = useMarket();
  const [buyPrice, setBuyPrice] = useState("");
  const [hirePrice, setHirePrice] = useState("");
  const [tokenId, setTokenId] = useState("");

  const handleList = async () => {
    if (!fileId) return;
    if (!buyPrice && !hirePrice) {
      return;
    }

    try {
      await listFile({
        fileId,
        buyPrice: buyPrice || undefined,
        hirePrice: hirePrice || undefined,
        tokenId: tokenId || undefined,
      });
      onClose();
      setBuyPrice("");
      setHirePrice("");
      setTokenId("");
    } catch (error) {
      console.error("Failed to list file", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>List on Marketplace</DialogTitle>
          <DialogDescription>
            Set your prices for selling or hiring "{fileName}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="buyPrice">Sale Price (ETH)</Label>
            <Input
              id="buyPrice"
              type="number"
              step="0.001"
              placeholder="e.g. 0.05"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hirePrice">Hire Price (ETH / day)</Label>
            <Input
              id="hirePrice"
              type="number"
              step="0.001"
              placeholder="e.g. 0.005"
              value={hirePrice}
              onChange={(e) => setHirePrice(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tokenId">Token ID (Optional)</Label>
            <Input
              id="tokenId"
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
          <Button onClick={handleList} disabled={isListing || (!buyPrice && !hirePrice)}>
            {isListing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Listing...
              </>
            ) : (
              "Confirm Listing"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
