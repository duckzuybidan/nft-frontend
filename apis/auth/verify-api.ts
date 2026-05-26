import api from "../api-config";

type VerifyRequest = {
  address: string;
  message: string;
  signature: string;
};

type VerifyResponse = {
  accessToken: string;
};

export const verifySignatureApi = async (data: VerifyRequest) => {
  const res = await api.post<VerifyResponse>("/auth/verify", data);
  return res.data;
};
