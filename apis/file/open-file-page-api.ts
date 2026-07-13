import api from "../api-config";

export type OpenFilePageResult = {
  blob: Blob;
  totalPages: number;
  currentPage: number;
};

export const openFilePageApi = async (
  fileId: string,
  page: number,
): Promise<OpenFilePageResult> => {
  const response = await api.get(`/file/open/${fileId}/${page}`, {
    responseType: "blob",
  });

  const totalPages = Number.parseInt(
    String(response.headers["x-total-pages"] ?? "1"),
    10,
  );
  const currentPage = Number.parseInt(
    String(response.headers["x-current-page"] ?? page),
    10,
  );

  return {
    blob: response.data as Blob,
    totalPages: Number.isNaN(totalPages) ? 1 : totalPages,
    currentPage: Number.isNaN(currentPage) ? page : currentPage,
  };
};
