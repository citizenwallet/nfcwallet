import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type paramsType = {
  address: string;
};

export async function GET(request: NextRequest, { params }: { params: paramsType }) {
  const apiKey = process.env.POAP_API_KEY || "";
  const limit = request.nextUrl.searchParams.get("limit");
  const apiCall = `https://api.poap.tech/actions/scan/${params.address}`;
  const headers = { "x-api-key": apiKey, "accept-type": "application/json" };
  const res = await fetch(apiCall, {
    method: "GET",
    headers,
  });
  console.log(">>> GET", apiCall);
  console.log(">>> headers", headers);
  const data = await res.json();
  if (limit && Number(limit) > 0) {
    console.log(">>> Returning limited data", data.length, limit, data);
    return Response.json(data.slice(0, Number(limit)));
  } else {
    console.log(">>> Returning data", data.length, data);
    return Response.json(data);
  }
}
