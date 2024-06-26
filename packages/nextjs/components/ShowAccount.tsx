"use client";

import Image from "next/image";
import Link from "next/link";
import PreviewAccountBadges from "./PreviewAccountBadges";
import QRCode from "react-qr-code";
import { createPublicClient, http } from "viem";
import { WagmiConfig, createConfig } from "wagmi";
import Linktree from "~~/components/Linktree";
import Plugins from "~~/components/Plugins";
import { TokenBalance } from "~~/components/scaffold-eth";
import { useProfile } from "~~/hooks/citizenwallet";
import chains from "~~/lib/chains";
import { getUrlFromIPFS } from "~~/utils/ipfs";

export default function ShowAccount({ accountAddress, config }: { accountAddress: string; config: any }) {
  const communitySlug = config?.community.alias;
  const [profile] = useProfile(communitySlug, accountAddress);
  const avatarUrl = getUrlFromIPFS(profile?.image_medium) || "/nfcwallet-icon.jpg";

  if (!config) return null;
  const publicClient = createPublicClient({
    chain: chains[config?.node.chain_id],
    transport: http(),
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    publicClient,
  });

  const hasPlugin = (plugin: string) => {
    if (communitySlug === "wallet.pay.brussels") return true;
    return config.plugins.includes(plugin);
  };

  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="max-w-xl mx-auto">
        <div className="text-center my-8">
          {profile && <h1>{profile.name}</h1>}
          {profile?.description && <h2 className="text-lg">{profile.description}</h2>}
          {!profile && config?.community.name && <h1>{config.community.name}</h1>}
        </div>
        <div className="flex flex-row my-14">
          <div className="w-1/2">
            {avatarUrl && (
              <div>
                <Image src={avatarUrl} alt="avatar" width="300" height="300" />
                {hasPlugin("poap") && (
                  <PreviewAccountBadges limit={5} accountAddress={accountAddress} communitySlug={communitySlug} />
                )}
              </div>
            )}
          </div>
          <div className="w-1/2">
            {accountAddress && (
              <div>
                <QRCode value={accountAddress} size={256} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
              </div>
            )}
          </div>
        </div>
        <div className="mx-auto max-w-xs">
          {config?.token.address && (
            <TokenBalance
              address={accountAddress}
              symbol={config.token.symbol}
              precision={2}
              tokenAddress={config.token.address}
              className="justify-center my-2"
            />
          )}
        </div>
        <div>{profile && <Linktree profile={profile} />}</div>
        {config.plugins && <Plugins config={config} accountAddress={accountAddress} />}
        <div className="flex justify-center text-sm my-8 pb-4">
          <Link href={`/${communitySlug}/${accountAddress}/edit`} className="w-full max-w-sm p-4">
            {!profile && <button className="btn btn-primary w-full max-w-sm">Edit profile</button>}
            {profile && <button className="btn btn-outline w-full max-w-sm">Edit profile</button>}
          </Link>
        </div>
      </div>
    </WagmiConfig>
  );
}
