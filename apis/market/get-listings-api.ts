import api from "../api-config";
import { PaginatedResponse } from "@/types/paginated-response";

const getMarketListingsApi = async (
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<any>> => {
  const response = await api.get("/market", {
    params: { page, limit },
  });
  return response.data;
};

export { getMarketListingsApi };
