import { NextRequest } from "next/server";
import { resolveAddress } from "@/lib/ens";
import { claimPoap, getPoapData } from "@/lib/poap";

// Ensure you're running in an environment that supports top-level await or wrap in an async function
type paramsType = {
  hash: string;
};

export async function GET(request: NextRequest, { params }: { params: paramsType }) {
  // Get the secret for the POAP
  const hash = params.hash;
  try {
    const data = await getPoapData(hash);
    if (data.Message) {
      return Response.json({ error: data.Message }, { status: 400 });
    }
    return Response.json(data);
  } catch (e) {
    console.error("Error:", e);
    return Response.json({ error: "Error fetching POAP secret" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: paramsType }) {
  const hash = params.hash;
  const { address, secret } = await request.json();
  let addr: string = address;
  if (!addr.startsWith("0x")) {
    addr = (await resolveAddress(address, "gno")) || "";
  }
  console.log("POST> Claiming POAP", hash, hash.length, "for", addr, "with secret", secret);
  if (!addr || !addr.match(/^0x[a-fA-F0-9]{40}$/)) {
    console.log("Invalid address", addr);
    return Response.json({ error: "Invalid address" }, { status: 400 });
  }
  if (!secret) {
    console.log("Invalid secret", secret);
    return Response.json({ error: "Invalid secret" }, { status: 400 });
  }

  try {
    const data = await claimPoap(addr, hash, secret);
    console.log(">>> Claimed POAP", data);
    return Response.json(data);
  } catch (e) {
    console.error("Error:", e);
    return Response.json({ error: "Error claiming POAP" }, { status: 500 });
  }
}
