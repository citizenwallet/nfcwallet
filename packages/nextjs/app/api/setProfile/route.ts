import { headers } from "next/headers";
import { NextRequest } from "next/server";
import CitizenWalletCommunity from "../../../lib/citizenwallet";
import { getServerPasswordHash } from "../../../utils/crypto";
import { generateRandomUsername } from "../../../utils/username";
import { BundlerService } from "@citizenwallet/sdk/dist/src/services/bundler";
import pinataSDK from "@pinata/sdk";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import accountFactoryContractAbi from "smartcontracts/build/contracts/accfactory/AccountFactory.abi.json";

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
  const matches = bearer.match(/(\d+)-(0x.*)-(0x.*)/);
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
    // we keep the old password
    if (existingProfile && existingProfile.hashedPassword) {
      data.hashedPassword = existingProfile.hashedPassword;
    }
  }
  data.username = data.username || generateRandomUsername(data.name);
  data.image = data.image?.replace("https://ipfs.internal.citizenwallet.xyz/", "ipfs://");
  data.image_small = data.image_small?.replace("https://ipfs.internal.citizenwallet.xyz/", "ipfs://");
  data.image_medium = data.image_medium?.replace("https://ipfs.internal.citizenwallet.xyz/", "ipfs://");
  console.log(">>> saving to ipfs", data);
  const resData = await pinata.pinJSONToIPFS(data);
  const newIpfsHash = resData.IpfsHash;
  const signer = new Wallet(process.env.PRIVATE_KEY || "");

  const address = signer.address;
  const provider = new JsonRpcProvider(cw.config.node.url);

  const accountFactoryContract = new Contract(
    cw.config.erc4337.account_factory_address,
    accountFactoryContractAbi,
    provider,
  );

  const serverAccountAddress = await accountFactoryContract.getFunction("getAddress")(address, 0);

  console.log(">>> serverAccountAddress", serverAccountAddress);

  const bundler = new BundlerService(cw.config);
  // for debugging, we wait until it's confirmed:
  try {
    const bundlerResponse = await bundler.setProfile(
      signer,
      serverAccountAddress,
      data.account,
      data.username,
      newIpfsHash,
    );
    console.log(">>> bundlerResponse", bundlerResponse);
    console.log(">>> env", process.env.NODE_ENV);
  } catch (e) {
    console.error(">>> error", e);
    return Response.json({ error: "Unable to save profile. Try with a different username." });
  }

  // on production, we can fire and forget
  // waitUntil(bundler.setProfile(signer, serverAccountAddress, data.account, data.username, newIpfsHash));
  return Response.json({ success: true, profile: data, ipfsHash: newIpfsHash });
}

const profiles = [
  {
    username: "xavier",
    account: "0xc77F9972A450Dc4BA0c78dc041b03bC7b7e62Ce0",
    ipfsHash: "QmaaBExAnWeJMHbrZWHWjZry2jTcn9xCkE8Vt8Sj1rJ58k",
  },
  {
    username: "bruno",
    account: "0xC94ac5B01243471Fc0C214EC53217108694a28CE",
    ipfsHash: "QmWQMZM2ztmSREe1ic5GvUodT3tffYEmSLc7RtpBU54vY8",
  },
  {
    username: "brunor",
    account: "0x20e18c3451931610456951029295dacb83779B19",
    ipfsHash: "QmcJTVYhkxS8Uv6V34aE6JvP272DFGPyUYqLioJnctwjpD",
  },
  {
    username: "friedger",
    account: "0x3f3bdA4af0a36D7d60c21c73ADC9201eBbCe09e2",
    ipfsHash: "QmPm6PE5YFq8EeiRthFzorev45MQxSAGP8r5NLXfoUKcoS",
  },
  {
    username: "chuckseattle",
    account: "0xB2BccA490e55bb32C6fFa37Ab69f91C969e00bac",
    ipfsHash: "QmW7BySaeWw9KjrwSDvUqLp8kAcK6o57iJGFt81nocR1AB",
  },
  {
    username: "cryptobar",
    account: "0x6936b950aeEf477DdfE130f4532aA0232eA8702b",
    ipfsHash: "QmXzVmjsriHfGzxFKegRtbwzd9Ue1h4JwqgBdSDko17w9X",
  },
  {
    username: "topup",
    account: "0xB16bBC7Bc0F01C49138053Ef5CDBcFDe53bD4F5E",
    ipfsHash: "QmP8jw2C8j1DqgoRv7Em8PBGthAcAvu8Fgnb7hExESSZuV",
  },
  {
    username: "cryptobar2",
    account: "0x6936b950aeEf477DdfE130f4532aA0232eA8702b",
    ipfsHash: "QmXzVmjsriHfGzxFKegRtbwzd9Ue1h4JwqgBdSDko17w9X",
  },
  {
    username: "jonasboury",
    account: "0x126f2Fd1C16B12e2743b8595A89267De31BcFB59",
    ipfsHash: "QmZLR7xrzz628CqMHcTbhjYLyCTUGWkrmyFnpd1AJ2xd65",
  },
  {
    username: "bank",
    account: "0x697073D98465054f4c287e4C435299a9107c9fF6",
    ipfsHash: "QmYkbqCqiCo7pNFoGRkdrZu8cDWmHB25uLFy7EgZ1fhtV5",
  },
  {
    username: "kevin",
    account: "0x5566D6D4Df27a6fD7856b7564F81266863Ba3ee8",
    ipfsHash: "QmV227peEQQY3CazqoLiWGv4gQp7KmVKV3F2kfeu4hUYtT",
  },
  {
    username: "vendor",
    account: "0xB171E72D591af98E123f59dC7dcc2F4c1d6e4863",
    ipfsHash: "QmdQMBgoenryBjo4uDCs8MPwtkxD2FYMh2Sc99dg9rryTx",
  },
  {
    username: "egg",
    account: "0xd98Be5daB61C26F07635d8F1E82e3F761d0AddB7",
    ipfsHash: "QmTKZweX5dZvLCNwhPGZjzsJTT7S83ZkAQ1h6ep9dStBTj",
  },
  {
    username: "pizza",
    account: "0xFE692337E2f11BFBd37F69A1503dbcC91cb02F63",
    ipfsHash: "QmSzTMs9WyXLZQw5oNGRNnANK4TFCtw15XP4usxpiYp5By",
  },
  {
    username: "202405-cryptobar",
    account: "0x9748cf0aA0554EF45c7Ee70CF1eA2C493BD57049",
    ipfsHash: "Qmc1TMWRw9BPKpV8yU5qAt2BHFxMomERFRTh1EmsBkGquT",
  },
  {
    username: "galoisfield",
    account: "0x022e80268451051d6b36137e2E5D9b3aD0EdcAdA",
    ipfsHash: "Qmd2espmUa8jVAszd3jo1BEuw5XVkQnMxwf7SAHjghPsmD",
  },
  {
    username: "a3wi",
    account: "0x11915308B4493D3Ecc3E729d1f13b46dC90Ba821",
    ipfsHash: "QmaskkBFuM1fLdwVYcR3mj3ys7h1txmFBoxaTYbRG6eDKL",
  },
  {
    username: "keyring",
    account: "0xC7bcb5Ad2A3E6Cba63A6EC2eA2eA18f0E53796C2",
    ipfsHash: "QmTRZgAA9b9DExCJysmfVJW4vfNjQekFwoRTHS3SwFtB6R",
  },
];

/**
 * Route to set multiple profiles (for migration)
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const index = request.nextUrl.searchParams.get("index");

  if (!secret || secret !== "hello321") {
    return Response.json({ error: "Wrong secret" });
  }

  const cw = new CitizenWalletCommunity("wallet.pay.brussels");
  await cw.loadConfig();

  const signer = new Wallet(process.env.PRIVATE_KEY || "");

  const address = signer.address;
  const provider = new JsonRpcProvider(cw.config.node.url);

  const accountFactoryContract = new Contract(
    cw.config.erc4337.account_factory_address,
    accountFactoryContractAbi,
    provider,
  );

  const serverAccountAddress = await accountFactoryContract.getFunction("getAddress")(address, 0);

  console.log(">>> serverAccountAddress", serverAccountAddress);

  const bundler = new BundlerService(cw.config);
  const data = profiles[parseInt(index || "0") || 0];
  console.log(">>> username", data.username);
  const tx = await bundler.setProfile(signer, serverAccountAddress, data.account, data.username, data.ipfsHash);
  return Response.json({
    tx,
    success: true,
    username: `@${data.username}`,
    profile: data,
    profiles: profiles.length,
    index,
  });
}
