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

const poaps = {
  "2024-07-04": { id: 175275, editCode: 599254 },
  "2024-07-05": { id: 175276, editCode: 111111 },
  "2024-07-06": { id: 175276, editCode: 111111 },
  "2024-07-08": { id: 175276, editCode: 111111 },
  "2024-07-09": { id: 175277, editCode: 111111 },
  "2024-07-10": { id: 175278, editCode: 111111 },
  "2024-07-11": { id: 175279, editCode: 111111 },
  "2024-07-12": { id: 175280, editCode: 111111 },
};

const poapOfTheDay = poaps[moment().format("YYYY-MM-DD")];

let hashes;

if (poapOfTheDay) {
  hashes = await getPoapHashes(poapOfTheDay.id, poapOfTheDay.editCode);
  setInterval(async () => {
    // update list of poaps
    hashes = await getPoapHashes(poapOfTheDay.id, poapOfTheDay.editCode);
  }, 10000);
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
