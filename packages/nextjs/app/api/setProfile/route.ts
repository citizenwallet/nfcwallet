import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { BundlerService } from "../../../lib/4337";
import CitizenWalletCommunity from "../../../lib/citizenwallet";
import { getServerPasswordHash } from "../../../utils/crypto";
import pinataSDK from "@pinata/sdk";
import { waitUntil } from "@vercel/functions";
import { Wallet } from "ethers";

if (!process.env.SECRET) {
  throw new Error("process.env.SECRET is required");
}
if (!process.env.PRIVATE_KEY) {
  throw new Error("process.env.PRIVATE_KEY) { is required");
}

const wallet = new Wallet(process.env.PRIVATE_KEY || "");
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

export async function POST(request: NextRequest) {
  const communitySlug = request.nextUrl.searchParams.get("communitySlug");

  if (!communitySlug) {
    return Response.json({ error: "Community slug is required" });
  }

  const headersList = headers();
  const authentication = headersList.get("authentication");
  console.log(">>> authentication", authentication);
  if (!authentication?.includes("Bearer")) {
    return Response.json({ error: "Authentication bearer missing" });
  }

  const bearer = authentication.substring(7);
  //  const bearer = `${expiryDate}-${data.account}-${signedMessage}`;
  console.log(">>> bearer", bearer);
  const matches = bearer.match(/(\d+)-(0x.*)-(0x.*)/);
  console.log(">>> matches", matches);
  if (matches?.length !== 4) {
    return Response.json({ error: "Invalid bearer format" });
  }
  const bearerTokens = bearer.split("-");
  const expiryDate = bearerTokens[0];
  // const accountAddress = bearerTokens[1];
  const signedMessage = bearerTokens[2];

  const d = new Date();
  const gracePeriod = 1000 * 60 * 5; // 5 minutes
  if (d.getTime() > parseInt(expiryDate) * 1000 + gracePeriod) {
    return Response.json({ error: "Authentication bearer expired" });
  }

  const data = await request.json();
  const msg = `${expiryDate}-${data.account}`;
  const newSignedMessage = await wallet.signMessage(msg);
  if (newSignedMessage !== signedMessage) {
    return Response.json({ error: "Invalid signature" });
  }

  const cw = new CitizenWalletCommunity(communitySlug);
  await cw.loadConfig();
  // if a new password has been set
  if (data.password) {
    const passwordHash = getServerPasswordHash(data.password, process.env.SECRET || "");
    console.log(">>> setting new password, frontend password:", data.password);
    data.hashedPassword = passwordHash;
    delete data.password;
    console.log(">>> backend password", data.password);
  } else {
    // we fetch the existing password hash
    const existingProfile = await cw.getProfile(data.account);
    console.log(">>> existing profile", existingProfile);
    // if (existingProfile && existingProfile.ipfsHash !== ipfsHash) {
    //   return Response.json({ error: "Invalid bearer: ipfsHash mismatch" });
    // }
    data.hashedPassword = existingProfile.hashedPassword;
  }
  console.log(">>> saving to ipfs", data);
  const resData = await pinata.pinJSONToIPFS(data);
  const newIpfsHash = resData.IpfsHash;
  const signer = new Wallet(process.env.PRIVATE_KEY || "");

  const bundler = new BundlerService(cw.config);
  waitUntil(
    bundler.setProfile(
      signer,
      "0xbA8e1bA697C26E106a51F85D6bBb3a925a627F5C", // TODO: get the server account address from the factory
      data.account,
      data.username,
      newIpfsHash,
    ),
  );
  return Response.json({ success: true, profile: data, ipfsHash: newIpfsHash });
}
