import { NextRequest } from "next/server";
import { getPoapData, getPoapHashes } from "@/lib/poap";
import { pickRandom } from "@/lib/utils";

// Ensure you're running in an environment that supports top-level await or wrap in an async function
type paramsType = {
  eventId: string;
};

const poaps = JSON.parse(process.env.POAP_CODES || "{}");

function getEditCode(eventId: string) {
  for (const key in poaps) {
    const poap = poaps[key];
    if (poap.id === eventId) return poap.editCode;
  }
}

export async function GET(request: NextRequest, { params }: { params: paramsType }) {
  // Get the secret for the POAP
  const eventId = params.eventId || "";
  try {
    const editCode = getEditCode(eventId);
    if (!editCode) {
      return Response.json({ error: `Unknown event ID (${eventId})` }, { status: 400 });
    }
    const hashes = await getPoapHashes(eventId, editCode);
    const selectedHash = pickRandom(hashes);

    const data = await getPoapData(selectedHash.qr_hash);
    if (data.Message) {
      return Response.json({ error: data.Message }, { status: 400 });
    }
    return Response.json({ eventId, hash: selectedHash.qr_hash, secret: data.secret });
  } catch (e) {
    console.error("Error:", e);
    return Response.json({ error: "Error fetching POAP secret" }, { status: 500 });
  }
}
