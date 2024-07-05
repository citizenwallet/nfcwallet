import { NextRequest } from "next/server";
import { getEvent } from "@/lib/poap";

type paramsType = {
  eventId: string;
};

export async function GET(request: NextRequest, { params }: { params: paramsType }) {
  const data = await getEvent(parseInt(params.eventId));

  return Response.json(data);
}
