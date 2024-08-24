import React from "react";
import EditProfile from "@/components/EditProfile";
import Error from "@/components/Error";
import CitizenWalletCommunity from "~~/lib/citizenwallet";
import { darkenHexColor, theme } from "~~/lib/colors";

type paramsType = {
  params: {
    communitySlug: string;
    accountAddress: string;
  };
};

export async function generateViewport({ params }: paramsType) {
  const cw = new CitizenWalletCommunity(params.communitySlug);
  const config = await cw.loadConfig();
  if (!config) {
    console.error(`Unable to load the ${params.communitySlug} community`);
    return;
  }
  const backgroundColor = darkenHexColor(config.community.theme.primary, 70);
  return {
    themeColor: backgroundColor,
  };
}

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

  const backgroundColor = darkenHexColor(config.community.theme.primary, 70);

  return (
    <div className="min-h-screen" style={{ background: backgroundColor }}>
      <EditProfile config={config} accountAddress={accountAddress} owner={searchParams.owner} theme={theme(config)} />
    </div>
  );
}
