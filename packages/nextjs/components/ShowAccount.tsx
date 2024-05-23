"use client";

import Image from "next/image";
import Link from "next/link";
import QRCode from "react-qr-code";
import { createPublicClient, http } from "viem";
import { WagmiConfig, createConfig } from "wagmi";
import Linktree from "~~/components/Linktree";
import Plugins from "~~/components/Plugins";
import { Address, TokenBalance } from "~~/components/scaffold-eth";
import { useProfile } from "~~/hooks/citizenwallet";
import chains from "~~/lib/chains";
import { getUrlFromIPFS } from "~~/utils/ipfs";

export default function ShowAccount({ accountAddress, config }: { accountAddress: string; config: any }) {
  const communitySlug = config?.community.alias;
  const [profile] = useProfile(communitySlug, accountAddress);
  const avatarUrl = profile ? getUrlFromIPFS(profile.image_medium) : "/nfcwallet-icon.jpg";

  if (!config) return null;
  const publicClient = createPublicClient({
    chain: chains[config?.node.chain_id],
    transport: http(),
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    publicClient,
  });

  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="max-w-xl mx-auto">
        <div className="text-center my-8">
          {profile && <h1>{profile.name}</h1>}
          {profile?.description && <h2>{profile.description}</h2>}
          {!profile && config?.community.name && <h1>{config.community.name}</h1>}
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
          <Link href={`/${communitySlug}/${accountAddress}/edit`}>edit profile</Link>
        </div>
      </div>
    </WagmiConfig>
  );
}
