import { NextResponse } from "next/server";
import { fetchServerBackend } from "../../../lib/backend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();

  const response = await fetchServerBackend(`/pacotes/search?${query}`);
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
