import React from "react";
import Error from "@/components/Error";
import ShowAccount from "@/components/ShowAccount";
import { Footer } from "@/containers/Footer";
import CitizenWalletCommunity from "~~/lib/citizenwallet";
import { darkenHexColor } from "~~/lib/colors";
import { theme } from "~~/lib/colors";

type paramsType = {
  params: {
    communitySlug: string;
    accountAddress: string;
  };
};

export async function generateViewport({ params }: paramsType) {
  const cw = new CitizenWalletCommunity(params.communitySlug);
  const config = await cw.loadConfig();
  const backgroundColor = darkenHexColor(config.community.theme.primary, 70);

  return {
    themeColor: backgroundColor,
  };
}

export default async function WalletProfile({ params }: paramsType) {
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

  // Add a EURb balance to regen village and commonshub wallets
  let secondConfig;
  if (["wallet.commonshub.brussels", "wallet.regenvillage.brussels"].includes(config.community.alias)) {
    const cw2 = new CitizenWalletCommunity("wallet.pay.brussels");
    secondConfig = await cw2.loadConfig();
  }

  const backgroundColor = darkenHexColor(config.community.theme.primary, 70);

  return (
    <div className="min-h-screen" style={{ background: backgroundColor }}>
      <ShowAccount config={config} accountAddress={accountAddress} secondConfig={secondConfig} theme={theme(config)} />
      <Footer />
    </div>
  );
}
