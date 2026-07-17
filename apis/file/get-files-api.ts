import api from "../api-config";
import { PaginatedResponse } from "@/types/paginated-response";

export type CollectionKind = "owned" | "copy" | "all";

export type CollectionSection<T> = PaginatedResponse<T>;

export type MyFilesResponse = {
  kind: CollectionKind;
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  owned: CollectionSection<any> | null;
  copies: CollectionSection<any> | null;
};

const getMyFilesApi = async (
  page: number = 1,
  limit: number = 10,
  kind: CollectionKind = "all",
): Promise<MyFilesResponse> => {
  const response = await api.get("/file/my-files", {
    params: { page, limit, kind },
  });
  return response.data;
};

export { getMyFilesApi };
