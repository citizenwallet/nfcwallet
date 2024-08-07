import { NextRequest } from "next/server";
import { resolveAddress } from "@/lib/ens";
import { hasPoap } from "@/lib/poap";

type paramsType = {
  address: string;
  eventId: string;
};

export async function GET(request: NextRequest, { params }: { params: paramsType }) {
  if (!params.eventId) return Response.json({ error: "Event ID is required" });
  let addr = params.address;
  if (!addr.startsWith("0x")) {
    addr = (await resolveAddress(params.address, "gno")) || "";
  }
  const data = await hasPoap(addr, parseInt(params.eventId));

  return Response.json(data);
}
