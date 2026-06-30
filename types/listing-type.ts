export type ListingType = {
  id: string;
  tokenId?: string;
  hirePrice?: string;
  buyPrice?: string;
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
