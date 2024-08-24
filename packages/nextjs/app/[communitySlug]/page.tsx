import Error from "@/components/Error";
import CommunityCardReader from "~~/components/CommunityCardReader";
import CitizenWalletCommunity from "~~/lib/citizenwallet";
import { darkenHexColor } from "~~/lib/colors";

export async function generateViewport({ params }: { params: { communitySlug: string } }) {
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

export default async function NFCScanner({ params }: { params: { communitySlug: string } }) {
  if (params.communitySlug === "favicon.ico") {
    return null;
  }
  const cw = new CitizenWalletCommunity(params.communitySlug);
  const config = await cw.loadConfig();
  if (!config) {
    return <Error msg={`Unable to load the ${params.communitySlug} community`} />;
  }

  const backgroundColor = darkenHexColor(config.community.theme.primary, 70);

  return (
    <div className="bg-gray-800 w-full min-h-screen text-white p-0 m-0 " style={{ background: backgroundColor }}>
      <CommunityCardReader communitySlug={params.communitySlug} />
    </div>
  );
}
