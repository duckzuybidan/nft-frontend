import api from "../api-config";

export const getHomepageApi = async (category?: string) => {
  const res = await api.get("/homepage", {
    params: category && category !== "All" ? { category } : undefined,
  });
  return res.data;
};

export const searchMarketplaceApi = async (q: string) => {
  const res = await api.get("/search", { params: { q } });
  return res.data;
};
