import api from "../api-config";

const buyCopyApi = async (
  listingId: string,
  amount: number = 1,
  txHash?: string,
): Promise<unknown> => {
  const response = await api.post(`/market/listing/${listingId}/buy-copy`, {
    amount,
    ...(txHash ? { txHash } : {}),
  });
  return response.data;
};

export default buyCopyApi;
