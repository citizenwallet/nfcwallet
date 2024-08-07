"use client";

import Image from "next/image";
import Link from "next/link";
import KioskProfileHeader from "../components/KioskProfileHeader";
import moment from "moment";
import { createPublicClient, http } from "viem";
import { WagmiConfig, createConfig } from "wagmi";
import { useProfile } from "~~/hooks/citizenwallet";
import { usePoaps } from "~~/hooks/usePoap";
import chains from "~~/lib/chains";

export default function ShowAccount({ accountAddress, config }: { accountAddress: string; config: any }) {
  const communitySlug = config?.community.alias;
  const [profile] = useProfile(communitySlug, accountAddress);
  const { data: poaps } = usePoaps(profile?.ownerAddress || accountAddress);

  if (!config) return null;
  const publicClient = createPublicClient({
    chain: chains[config?.node.chain_id],
    transport: http(),
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    publicClient,
  });

  const sections = {};
  if (poaps) {
    poaps.map(poap => {
      const month = moment(poap.created).format("MMMM YYYY");
      if (!sections[month]) {
        sections[month] = [];
      }
      sections[month].push(poap);
    });

    console.log(sections);
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="max-w-xl mx-auto">
        <KioskProfileHeader greeting={`Hey, ${profile?.name || "regen"}!`} profile={profile} config={config} />

        <div className="mx-2">
          {Object.keys(sections).length > 0 &&
            Object.keys(sections).map(sectionTitle => (
              <div key={sectionTitle}>
                <h2 className="mt-8 mb-2 font-bold">{sectionTitle}</h2>
                {sections[sectionTitle].length > 0 &&
                  sections[sectionTitle].map(poap => (
                    <div
                      key={poap.tokenId}
                      className="rounded-full w-full h-full overflow-hidden my-2"
                      style={{ maxWidth: "500px", maxHeight: "500px" }}
                    >
                      <Link href={`https://collectors.poap.xyz/token/${poap.tokenId}`}>
                        <Image
                          src={`${poap.event.image_url}?size=large`}
                          width={500}
                          height={500}
                          alt={poap.event.name}
                        />
                      </Link>
                    </div>
                  ))}
              </div>
            ))}
        </div>
      </div>
    </WagmiConfig>
  );
}
