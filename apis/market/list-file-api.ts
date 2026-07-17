import api from "../api-config";

export const listFileApi = async (data: {
  fileId: string;
  tokenId?: string;
  copyPrice?: string;
  /** @deprecated Use copyPrice */
  hirePrice?: string;
  buyPrice?: string;
  maxCopies?: number;
  collectionId?: string;
}) => {
  const response = await api.post("/market/list", {
    fileId: data.fileId,
    tokenId: data.tokenId,
    buyPrice: data.buyPrice,
    maxCopies: data.maxCopies,
    copyPrice: data.copyPrice ?? data.hirePrice,
    collectionId: data.collectionId,
  });
  return response.data;
};
