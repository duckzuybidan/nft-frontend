export type ListingType = {
  id: string;
  tokenId?: string;
  /** ERC-1155 Buy Copy price */
  copyPrice?: string | number;
  /** @deprecated Use copyPrice */
  hirePrice?: string | number;
  buyPrice?: string | number;
  maxCopies?: number;
  copiesSold?: number;
  copiesRemaining?: number;
  copiesSoldOut?: boolean;
  isActive: boolean;
  createdAt: string;
  file: {
    id: string;
    cid: string;
    createdAt: string;
    userId: string;
    metadata: {
      id: string;
      fileId: string;
      fileName: string;
      mimeType: string;
      size: number;
      previewImage: string | null;
      createdAt: string;
    };
    user: {
      walletAddress: string;
    };
  };
};

/** Normalize legacy hirePrice responses into copyPrice */
export function getCopyPrice(listing: {
  copyPrice?: string | number | null;
  hirePrice?: string | number | null;
}): string | undefined {
  const value = listing.copyPrice ?? listing.hirePrice;
  if (value === null || value === undefined || value === "") return undefined;
  return String(value);
}
