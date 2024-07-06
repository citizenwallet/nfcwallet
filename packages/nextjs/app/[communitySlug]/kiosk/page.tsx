"use server";

import Error from "@/components/Error";
import { getPoapHashes } from "@/lib/poap";
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

let hashes;

if (poapOfTheDay) {
  hashes = await getPoapHashes(poapOfTheDay.id, poapOfTheDay.editCode);
}

export default async function KioskPage({ params }: { params: { communitySlug: string } }) {
  if (params.communitySlug === "favicon.ico") {
    return null;
  }

  const poap = poapOfTheDay
    ? {
        id: poapOfTheDay.id,
        hashes,
      }
    : undefined;

  const cw = new CitizenWalletCommunity(params.communitySlug);
  const config = await cw.loadConfig();

  if (!config) {
    return <Error msg={`Unable to load the ${params.communitySlug} community`} />;
  }

  return (
    <div style={{ backgroundColor: theme.secondary }}>
      <CommunityKiosk config={config} communitySlug={params.communitySlug} theme={theme} poap={poap} />
    </div>
  );
}
