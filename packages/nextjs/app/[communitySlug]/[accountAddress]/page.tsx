import React from "react";
import Error from "@/components/Error";
import ShowAccount from "@/components/ShowAccount";
import CitizenWalletCommunity from "~~/lib/citizenwallet";

export default async function WalletProfile({
  params,
  searchParams,
}: {
  params: { communitySlug: string; accountAddress: string };
  searchParams: { owner: string };
}) {
  // const [urlRecord, setUrlRecord] = useState("");
  const { accountAddress } = params;
  if (accountAddress.length !== 42 || accountAddress.substring(0, 2) !== "0x") {
    return <Error msg="Invalid account address" />;
  }

  const cw = new CitizenWalletCommunity(params.communitySlug);
  const config = await cw.loadConfig();

  return (
    <div>
      {/* <p>Serial Number: {serialNumber}</p> */}
      <ShowAccount config={config} accountAddress={accountAddress} owner={searchParams.owner} />
    </div>
  );
}
