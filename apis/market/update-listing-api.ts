import api from "../api-config";

export const updateListingApi = async (
  listingId: string,
  data: {
    hirePrice?: string;
    buyPrice?: string;
    tokenId?: string;
  }
) => {
  const response = await api.patch(`/market/listing/${listingId}`, data);
  return response.data;
};
