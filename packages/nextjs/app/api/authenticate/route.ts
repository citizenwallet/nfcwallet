import { NextRequest } from "next/server";
import CitizenWalletCommunity from "../../../lib/citizenwallet";
import { getServerPasswordHash } from "../../../utils/crypto";
import { Wallet } from "ethers";

if (!process.env.SECRET) {
  throw new Error("process.env.SECRET is required");
}
if (!process.env.PRIVATE_KEY) {
  throw new Error("process.env.PRIVATE_KEY is required");
}

const wallet = new Wallet(process.env.PRIVATE_KEY || "");

let requestsLastPeriod: { [key: string]: number } = {};
setInterval(() => {
  requestsLastPeriod = {};
}, 2000);

/**
 * /api/authenticate
 * @param request formData: { account: string, password: string }
 * @returns { bearer }
 */
export async function POST(request: NextRequest) {
  const communitySlug = request.nextUrl.searchParams.get("communitySlug");

  if (!communitySlug) {
    return Response.json({ error: "Community slug is required" });
  }

  const data = await request.json();
  // console.log(">>> authenticate with data", data);
  requestsLastPeriod[data.account] = requestsLastPeriod[data.account] || 0;
  requestsLastPeriod[data.account]++;
  if (requestsLastPeriod[data.account] > 1) {
    return Response.json({ error: "Too many requests" });
  }
  const passwordHash = getServerPasswordHash(data.password || "", process.env.SECRET || "");
  // const passwordHash = "0x82e5064160aec9d797462f5ce0c332b6b731eaa3b6c780e8fb9ed572f9721435";
  const cw = new CitizenWalletCommunity(communitySlug);
  await cw.loadConfig();

  const profile = await cw.getProfile(data.account);

  const expiryDate = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 10; // 10h for CELO Gather
  const msg = `${expiryDate}-${data.account}`;
  console.log(">>> requesting bearer for", msg);
  const signedMessage = await wallet.signMessage(msg);

  if (profile && profile.hashedPassword) {
    if (profile.hashedPassword !== passwordHash) {
      return Response.json({ error: "Invalid password" });
    }
  }
  const bearer = `${expiryDate}-${data.account}-${signedMessage}`;
  return Response.json({ success: true, bearer });
}
