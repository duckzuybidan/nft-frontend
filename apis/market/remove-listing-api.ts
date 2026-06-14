import api from "../api-config";

export const removeListingApi = async (listingId: string) => {
  const response = await api.delete(`/market/listing/${listingId}`);
  return response.data;
};
