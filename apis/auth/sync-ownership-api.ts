import api from "../api-config";

export interface SyncOwnershipResponse {
  synced: boolean;
  claimed: number;
  listingsUpdated: number;
  accessGrants: number;
  scanned: number;
  skipped: boolean;
  message?: string;
}

export const syncOwnershipApi = async (): Promise<SyncOwnershipResponse> => {
  const response = await api.post<SyncOwnershipResponse>("/auth/sync-ownership");
  return response.data;
};
