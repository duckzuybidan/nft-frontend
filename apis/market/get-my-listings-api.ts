import api from "../api-config";
import { PaginatedResponse } from "@/types/paginated-response";
import { ListingType } from "@/types/listing-type";

export const getMyListingsApi = async (
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<ListingType>> => {
  const response = await api.get("/market/my-listings", {
    params: { page, limit },
  });
  return response.data;
};
