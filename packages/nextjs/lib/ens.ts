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

export async function resolveAddress(ensname: string, chain?: string) {
  if (chain && chain.toLowerCase() !== "eth") {
    const records = await client.getRecords({ name: ensname, coins: ["eth", chain] });
    const coins: Coins = {};
    records.coins.map(coin => {
      coins[coin.name] = coin.value;
    });
    return coins[chain] || coins["eth"];
  }
  const ethAddress = await client.getAddressRecord({ name: ensname, coin: chain });
  return ethAddress?.value;
}

export async function getRecords(ensname: string, coins?: string[]) {
  const result = await client.getRecords({
    name: ensname,
    coins,
    contentHash: true,
  });
  return result;
}
export async function getTextRecord(ensname: string, key: string) {
  const result = await client.getTextRecord({
    name: ensname,
    key,
  });
  return result;
}
