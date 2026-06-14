import api from "../api-config";

export const openFileApi = async (fileId: string) => {
  const response = await api.get(`/file/open/${fileId}`, {
    responseType: "blob",
  });
  return response.data;
};
