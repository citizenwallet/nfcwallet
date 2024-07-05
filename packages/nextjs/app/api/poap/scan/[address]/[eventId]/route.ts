import { NextRequest } from "next/server";
import { hasPoap } from "@/lib/poap";

type paramsType = {
  address: string;
  eventId: string;
};

export async function GET(request: NextRequest, { params }: { params: paramsType }) {
  if (!params.eventId) return Response.json({ error: "Event ID is required" });
  const data = await hasPoap(params.address, parseInt(params.eventId));

  return Response.json(data);
}
