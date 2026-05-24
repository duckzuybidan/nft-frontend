import api from "../api-config";

type VerifyRequest = {
  address: string;
  message: string;
  signature: string;
};

type VerifyResponse = {
  accessToken: string;
};

export const verifySignature = async (data: VerifyRequest) => {
  const res = await api.post<VerifyResponse>("/auth/verify", data);
  return res.data;
};
