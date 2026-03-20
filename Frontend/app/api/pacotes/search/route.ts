import { NextResponse } from "next/server";

const API_BASE =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:3001/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();

  const response = await fetch(`${API_BASE}/pacotes/search?${query}`);
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
