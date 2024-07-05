import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type paramsType = {
  address: string;
};

export async function GET(request: NextRequest, { params }: { params: paramsType }) {
  const apiKey = process.env.POAP_API_KEY || "";
  const limit = request.nextUrl.searchParams.get("limit");

  const response = await fetch(`https://api.poap.tech/actions/scan/${params.address}`, {
    headers: { "x-api-key": apiKey },
  });
  const data = await response.json();
  if (limit && Number(limit) > 0) {
    return Response.json(data.slice(0, Number(limit)));
  } else {
    return Response.json(data);
  }
}
