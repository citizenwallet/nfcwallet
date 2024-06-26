"use client";

import Image from "next/image";
import Link from "next/link";
import moment from "moment";
import QRCode from "react-qr-code";
import { createPublicClient, http } from "viem";
import { WagmiConfig, createConfig } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useProfile } from "~~/hooks/citizenwallet";
import { usePoaps } from "~~/hooks/poap";
import chains from "~~/lib/chains";
import { getUrlFromIPFS } from "~~/utils/ipfs";

export default function ShowAccount({ accountAddress, config }: { accountAddress: string; config: any }) {
  const communitySlug = config?.community.alias;
  const [profile] = useProfile(communitySlug, accountAddress);
  const avatarUrl = getUrlFromIPFS(profile?.image_medium) || "/nfcwallet-icon.jpg";
  const { data: poaps } = usePoaps(accountAddress);

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
        <div className="text-center my-8">
          {profile && <h1>{profile.name} Badges</h1>}
          {profile?.description && <h2 className="text-lg">{profile.description}</h2>}
          {!profile && config?.community.name && <h1>{config.community.name} Badges</h1>}
        </div>
        <div className="flex flex-row my-14">
          <div className="w-1/2">{avatarUrl && <Image src={avatarUrl} alt="avatar" width="300" height="300" />}</div>
          <div className="w-1/2">
            {accountAddress && (
              <div>
                <QRCode value={accountAddress} size={256} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                <Address address={accountAddress} format="short" className="justify-center my-2" />
              </div>
            )}
          </div>
        </div>

        <div className="mx-2">
          {Object.keys(sections).length > 0 &&
            Object.keys(sections).map(sectionTitle => (
              <div key={sectionTitle}>
                <h2 className="mt-8 mb-2 font-bold">{sectionTitle}</h2>
                {sections[sectionTitle].length > 0 &&
                  sections[sectionTitle].map(poap => (
                    <div key={poap.tokenId} className="rounded-full overflow-hidden my-2">
                      <Link href={`https://collectors.poap.xyz/token/${poap.tokenId}`}>
                        <Image
                          src={`${poap.event.image_url}?size=large`}
                          width={512}
                          height={512}
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
