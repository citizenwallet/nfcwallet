import React from "react";
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

  const cw = new CitizenWalletCommunity(params.communitySlug);
  const config = await cw.loadConfig();

  return (
    <div>
      {/* <p>Serial Number: {serialNumber}</p> */}
      <ShowAccount config={config} accountAddress={params.accountAddress} owner={searchParams.owner} />
    </div>
  );
}
