import api from "../api-config";

export type CollectionStats = {
  totalItems: number;
  totalOwners: number;
  totalVolume: number;
  totalSales?: number;
  weeklyVolume?: number;
  weeklySales?: number;
  floorPrice: number | null;
};

export type CollectionType = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  category: string;
  verified: boolean;
  website?: string | null;
  twitter?: string | null;
  discord?: string | null;
  createdAt: string;
  creator?: { id: string; walletAddress: string };
  stats?: CollectionStats;
  _count?: { files: number };
  membershipRole?: "owner" | "contributor" | "pending" | null;
};

export type CollectionMember = {
  id: string;
  status: "pending" | "approved" | "rejected";
  user: { id: string; walletAddress: string };
  createdAt: string;
};

export const createCollectionApi = async (body: {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  category?: string;
  website?: string;
  twitter?: string;
  discord?: string;
}) => {
  const res = await api.post("/collections", body);
  return res.data as CollectionType;
};

export const updateCollectionApi = async (
  id: string,
  body: {
    name?: string;
    slug?: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    category?: string;
    website?: string;
    twitter?: string;
    discord?: string;
  },
) => {
  const res = await api.patch(`/collections/${id}`, body);
  return res.data as CollectionType;
};

export const getMyCollectionsApi = async () => {
  const res = await api.get("/collections/mine");
  return res.data as CollectionType[];
};

export const listCollectionsApi = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  q?: string;
}) => {
  const res = await api.get("/collections", { params });
  return res.data as {
    data: CollectionType[];
    total: number;
    page: number;
    totalPages: number;
  };
};

export const getCollectionBySlugApi = async (slug: string) => {
  const res = await api.get(`/collections/${slug}`);
  return res.data as CollectionType;
};

export const getCollectionItemsApi = async (
  slug: string,
  page = 1,
  limit = 12,
) => {
  const res = await api.get(`/collections/${slug}/items`, {
    params: { page, limit },
  });
  return res.data;
};

export const moveFileToCollectionApi = async (
  fileId: string,
  collectionId: string | null,
) => {
  const res = await api.post("/collections/move-file", {
    fileId,
    collectionId,
  });
  return res.data;
};

export const requestJoinCollectionApi = async (collectionId: string) => {
  const res = await api.post("/collections/members/request", { collectionId });
  return res.data;
};

export const inviteCollectionMemberApi = async (
  collectionId: string,
  walletAddress: string,
) => {
  const res = await api.post("/collections/members/invite", {
    collectionId,
    walletAddress,
  });
  return res.data as CollectionMember;
};

export const listCollectionMembersApi = async (collectionId: string) => {
  const res = await api.get(`/collections/members/${collectionId}`);
  return res.data as CollectionMember[];
};

export const updateCollectionMemberApi = async (
  memberId: string,
  status: "approved" | "rejected",
) => {
  const res = await api.patch(`/collections/members/${memberId}`, { status });
  return res.data as CollectionMember;
};

export const removeCollectionMemberApi = async (memberId: string) => {
  const res = await api.delete(`/collections/members/${memberId}`);
  return res.data;
};
