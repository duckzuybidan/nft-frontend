import api from "../api-config";

export const listFileApi = async (data: {
  fileId: string;
  tokenId?: string;
  hirePrice?: string;
  buyPrice?: string;
}) => {
  const response = await api.post("/market/list", data);
  return response.data;
};
