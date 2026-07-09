import api from "../api-config";
import { ACCESS_TOKEN } from "@/lib/var";

export const openFileApi = async (fileId: string) => {
  const response = await api.get(`/file/open/${fileId}`, {
    responseType: "blob",
  });
  return response.data;
};

export const streamFileUrl = (fileId: string) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  return `/api/file/stream/${fileId}${token ? `?token=${token}` : ""}`;
};
