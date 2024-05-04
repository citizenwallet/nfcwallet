import { NextRequest } from "next/server";
import CitizenWalletCommunity from "../../../../lib/citizenwallet";

type paramsType = {
  serialNumber: string;
};

export async function GET(request: NextRequest, { params }: { params: paramsType }) {
  const serialNumber = params.serialNumber;
  const communitySlug = request.nextUrl.searchParams.get("communitySlug");

  if (!communitySlug) {
    return Response.json({ error: "Community slug is required" });
  }
  const community = new CitizenWalletCommunity(communitySlug);
  const accountAddress = await community.getCardAccountAddress(serialNumber);

  return Response.json({ accountAddress });
}
