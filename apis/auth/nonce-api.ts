import api from "../api-config";

type NonceRequest = {
  address: string;
};

type NonceResponse = {
  nonce: string;
};

export const getNonceApi = async (data: NonceRequest) => {
  const res = await api.post<NonceResponse>("/auth/nonce", data);
  return res.data;
};
