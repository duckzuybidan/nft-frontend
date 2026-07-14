import api from "../api-config";

export type UpdateListingData = {
  hirePrice?: string;
  buyPrice?: string;
  isActive?: boolean;
};

export const updateListingApi = async (
  listingId: string,
  data: UpdateListingData,
) => {
  const response = await api.patch(`/market/listing/${listingId}`, data);
  return response.data;
};
