import api from "../api-config";

export type UpdateListingData = {
  copyPrice?: string;
  /** @deprecated Use copyPrice */
  hirePrice?: string;
  buyPrice?: string;
  maxCopies?: number;
  isActive?: boolean;
};

export const updateListingApi = async (
  listingId: string,
  data: UpdateListingData,
) => {
  const response = await api.patch(`/market/listing/${listingId}`, {
    buyPrice: data.buyPrice,
    maxCopies: data.maxCopies,
    isActive: data.isActive,
    copyPrice: data.copyPrice ?? data.hirePrice,
  });
  return response.data;
};
