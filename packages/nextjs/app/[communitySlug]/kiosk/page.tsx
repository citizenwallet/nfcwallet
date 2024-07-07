"use server";

import Error from "@/components/Error";
import CitizenWalletText from "@/public/citizenwallet-logo-text.svg";
import moment from "moment";
import CommunityKiosk from "~~/components/CommunityKiosk";
import CitizenWalletCommunity from "~~/lib/citizenwallet";

const theme = {
  primary: "#1CB260",
  secondary: "#01392C",
  text: "#fff",
};

const poaps = JSON.parse(process.env.POAP_CODES || "{}");
const poapOfTheDay = poaps[moment().format("YYYY-MM-DD")];

const version = process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7) : "git sha";

export default async function KioskPage({ params }: { params: { communitySlug: string } }) {
  if (params.communitySlug === "favicon.ico") {
    return null;
  }

  const cw = new CitizenWalletCommunity(params.communitySlug);
  const config = await cw.loadConfig();

  if (!config) {
    return <Error msg={`Unable to load the ${params.communitySlug} community`} />;
  }

  return (
    <div style={{ backgroundColor: theme.secondary }}>
      <CommunityKiosk config={config} communitySlug={params.communitySlug} theme={theme} poap={poapOfTheDay} />
      <div className="text-center p-4 mt-8 flex justify-center items-center">
        <a href="https://citizenwallet.xyz">
          <div className="text-xs text-[#2FA087]">Powered by</div>
          <div className="flex justify-center items-center">
            <CitizenWalletText className="w-32 h-6 mr-2 text-white opacity-60" />
          </div>
        </a>
      </div>
      <div className="text-gray-500 text-opacity-50 text-center text-xs">{version}</div>
    </div>
  );
}
