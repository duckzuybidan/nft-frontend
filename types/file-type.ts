export type FileAccessType = "owned" | "copy";

export type FileType = {
  id: string;
  cid: string;
  fileName: string;
  mimeType: string;
  size: number;
  previewImage: string | null;
  createdAt: string;
  userId: string;
  /** ERC-721 ownership vs ERC-1155 licensed copy */
  accessType: FileAccessType;
  tokenId?: string | null;
  copyBalance?: number | null;
};
