import api from "../api-config";
import { PaginatedResponse } from "@/types/paginated-response";

const getMyFilesApi = async (
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<any>> => {
  const response = await api.get("/file/my-files", {
    params: { page, limit },
  });
  return response.data;
};

export { getMyFilesApi };
