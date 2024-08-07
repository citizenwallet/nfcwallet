import { NextRequest } from "next/server";
import { resolveAddress } from "@/lib/ens";

export const dynamic = "force-dynamic";

type paramsType = {
  address: string;
};

export async function GET(request: NextRequest, { params }: { params: paramsType }) {
  const apiKey = process.env.POAP_API_KEY || "";
  const limit = request.nextUrl.searchParams.get("limit");
  let addr = params.address;
  if (!addr.startsWith("0x")) {
    addr = (await resolveAddress(params.address, "gno")) || "";
  }
  const apiCall = `https://api.poap.tech/actions/scan/${params.address}`;
  const headers = {
    "x-api-key": apiKey,
    "accept-type": "application/json",
    "Cache-Control": "no-cache",
  };
  const res = await fetch(apiCall, {
    method: "GET",
    cache: "no-store",
    headers,
  });
  const data = await res.json();
  if (limit && Number(limit) > 0) {
    return Response.json(data.slice(0, Number(limit)));
  } else {
    return Response.json(data);
  }
}
