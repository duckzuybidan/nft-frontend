import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // Get range header from the client request and pass it to the backend
  const rangeHeader = request.headers.get("range");

  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/file/stream/${fileId}`;

  const headers: HeadersInit = {};
  if (rangeHeader) {
    headers["Range"] = rangeHeader;
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(backendUrl, {
    headers,
  });

  // Create a new response with the backend's body and headers
  const newHeaders = new Headers(res.headers);

  // Set proper CORS headers
  newHeaders.set("Access-Control-Allow-Origin", "*");

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: newHeaders,
  });
}
