import api from "../api-config";

export const listSecondaryApi = async (page = 1, limit = 12) => {
  const res = await api.get("/market/secondary", { params: { page, limit } });
  return res.data;
};

export const getMySecondaryApi = async () => {
  const res = await api.get("/market/secondary/mine");
  return res.data as {
    active: any[];
    sold: any[];
    purchases: any[];
  };
};

export const createSecondaryListingApi = async (body: {
  fileId: string;
  tokenId: string;
  onChainListingId: string;
  amount: number;
  pricePerPass: number;
  txHash?: string;
}) => {
  const res = await api.post("/market/secondary/list", body);
  return res.data;
};

export const buySecondaryListingApi = async (
  id: string,
  amount: number,
  txHash?: string,
) => {
  const res = await api.post(`/market/secondary/${id}/buy`, { amount, txHash });
  return res.data;
};

export const cancelSecondaryListingApi = async (
  id: string,
  txHash?: string,
) => {
  const res = await api.delete(`/market/secondary/${id}`, {
    data: { txHash },
  });
  return res.data;
};
