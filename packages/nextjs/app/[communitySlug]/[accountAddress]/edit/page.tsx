import React from "react";
import EditProfile from "@/components/EditProfile";
import Error from "@/components/Error";
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

  if (!config) {
    return <Error msg={`Unable to load the ${params.communitySlug} community`} />;
  }

  return (
    <div>
      <EditProfile config={config} accountAddress={accountAddress} owner={searchParams.owner} />
    </div>
  );
}
