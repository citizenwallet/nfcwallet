import { NextRequest } from "next/server";
import { BundlerService } from "../../../lib/4337";
import CitizenWalletCommunity from "../../../lib/citizenwallet";
import { getServerPasswordHash } from "../../../utils/crypto";
import pinataSDK from "@pinata/sdk";
import { Wallet } from "ethers";

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

if (!process.env.SECRET) {
  throw new Error("process.env.SECRET is required");
}

export async function POST(request: NextRequest) {
  const communitySlug = request.nextUrl.searchParams.get("communitySlug");

  if (!communitySlug) {
    return Response.json({ error: "Community slug is required" });
  }

  const data = await request.json();
  const passwordHash = getServerPasswordHash(data.password, process.env.SECRET || "");

  const cw = new CitizenWalletCommunity(communitySlug);
  await cw.loadConfig();

  const profile = await cw.getProfile(data.account);

  if (profile && profile.password) {
    if (profile.password !== passwordHash) {
      return Response.json({ error: "Invalid password" });
    }
  }

  data.password = passwordHash;

  const resData = await pinata.pinJSONToIPFS(data);

  const ipfsHash = resData.IpfsHash;

  const signer = new Wallet(process.env.PRIVATE_KEY || "");

  const bundler = new BundlerService(cw.config);
  await bundler.setProfile(
    signer,
    "0xbA8e1bA697C26E106a51F85D6bBb3a925a627F5C", // TODO: get the contract address from the config
    data.account,
    data.username,
    ipfsHash,
  );
  return Response.json({ success: true });
}
