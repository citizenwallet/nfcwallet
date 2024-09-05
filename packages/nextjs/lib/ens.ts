import { createEnsPublicClient } from "@ensdomains/ensjs";
import { http } from "viem";
import { mainnet } from "viem/chains";

interface Coins {
  [key: string]: string;
}

const client = createEnsPublicClient({
  chain: mainnet,
  transport: http(),
});

interface ENSCacheType {
  [key: string]: string;
}
const ENScache: ENSCacheType = {};

export async function resolveAddress(ensname: string, chain?: string) {
  const normalizedEnsname = ensname.trim().toLowerCase();
  const cacheKey = `${normalizedEnsname}-${chain || "eth"}`;
  if (ENScache[cacheKey]) {
    return ENScache[cacheKey];
  }
  let addr: string;
  if (chain && chain.toLowerCase() !== "eth") {
    const records = await client.getRecords({ name: normalizedEnsname, coins: ["eth", chain] });
    const coins: Coins = {};
    records.coins.map(coin => {
      coins[coin.name] = coin.value;
    });
    addr = coins[chain] || coins["eth"];
    ENScache[cacheKey] = addr;
    return addr;
  }
  const ethAddress = await client.getAddressRecord({ name: normalizedEnsname, coin: chain });
  addr = ethAddress?.value || "";
  ENScache[cacheKey] = addr;
  return addr;
}

export async function getRecords(ensname: string, coins?: string[]) {
  const normalizedEnsname = ensname.trim().toLowerCase();
  const result = await client.getRecords({
    name: normalizedEnsname,
    coins,
    contentHash: true,
  });
  return result;
}
export async function getTextRecord(ensname: string, key: string) {
  const normalizedEnsname = ensname.trim().toLowerCase();
  const result = await client.getTextRecord({
    name: normalizedEnsname,
    key,
  });
  return result;
}
