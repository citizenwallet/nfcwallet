import { NextRequest } from "next/server";
import CitizenWalletCommunity from "@/lib/citizenwallet";

export async function POST(request: NextRequest) {
  const { address, communitySlug, description, amount } = await request.json();
  console.log("POST> Minting token", communitySlug, "for", address);
  if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
    console.log("Invalid address", address);
    return Response.json({ error: "Invalid address" }, { status: 400 });
  }

  const cw = new CitizenWalletCommunity(communitySlug);

  try {
    const data = await cw.mint(address, amount, description);
    console.log(">>> Minted token", data);
    return Response.json(data);
  } catch (e) {
    console.error("Error:", e);
    return Response.json({ error: "Error minting token" }, { status: 500 });
  }
}
