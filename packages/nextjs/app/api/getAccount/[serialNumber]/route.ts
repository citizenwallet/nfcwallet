import { getHash } from "../../../../utils/crypto";

type paramsType = { serialNumber: string };

export async function GET(request: Request, { params }: { params: paramsType }) {
  const serialNumber = params.serialNumber;

  // const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const hash = getHash(
    serialNumber,
    BigInt(process.env.NEXT_PUBLIC_CHAIN_ID || 0),
    process.env.NEXT_PUBLIC_CARDMANAGER_CONTRACT_ADDRESS || "",
  );

  return Response.json({ accountAddress: hash });
}
