import { createEnsPublicClient } from "@ensdomains/ensjs";
import { http } from "viem";
import { mainnet } from "viem/chains";

const client = createEnsPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function resolveAddress(ensname: string) {
  const ethAddress = await client.getAddressRecord({ name: ensname });
  return ethAddress?.value;
}
