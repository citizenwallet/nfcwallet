import React from "react";
import Error from "@/components/Error";
import ShowAccount from "@/components/ShowAccount";
import { Footer } from "@/containers/Footer";
import CitizenWalletCommunity from "~~/lib/citizenwallet";
import { darkenHexColor } from "~~/lib/colors";

const theme = {
  primary: "#1CB260",
  secondary: "#01392C",
  text: "#fff",
};

export default async function WalletProfile({ params }: { params: { communitySlug: string; accountAddress: string } }) {
  // const [urlRecord, setUrlRecord] = useState("");
  const { accountAddress } = params;
  if (accountAddress.length !== 42 || accountAddress.substring(0, 2) !== "0x") {
    return <Error msg="Invalid account address" />;
  }

  const cw = new CitizenWalletCommunity(params.communitySlug);
  const config = await cw.loadConfig();

  let secondConfig;
  if (config.community.alias === "wallet.regenvillage.brussels") {
    const cw2 = new CitizenWalletCommunity("wallet.pay.brussels");
    secondConfig = await cw2.loadConfig();
  }

  if (!config) {
    return <Error msg={`Unable to load the ${params.communitySlug} community`} />;
  }

  return (
    <div className="min-h-screen" style={{ background: darkenHexColor(config.community.theme.primary, 70) }}>
      <ShowAccount config={config} secondConfig={secondConfig} accountAddress={accountAddress} theme={theme} />
      <Footer />
    </div>
  );
}
