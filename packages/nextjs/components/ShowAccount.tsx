"use client";

import Image from "next/image";
import Link from "next/link";
import QRCode from "react-qr-code";
import { createPublicClient, http } from "viem";
import { base, baseSepolia, celo, celoAlfajores, gnosis, gnosisChiado, polygon, polygonMumbai } from "viem/chains";
import { WagmiConfig, createConfig } from "wagmi";
import { Address, TokenBalance } from "~~/components/scaffold-eth";
import { useProfile } from "~~/hooks/citizenwallet";
import { getUrlFromIPFS } from "~~/utils/ipfs";

interface ChainMap {
  [key: number]: any;
}

const chains: ChainMap = {
  137: polygon,
  80001: polygonMumbai,
  100: gnosis,
  10200: gnosisChiado,
  8453: base,
  84532: baseSepolia,
  42220: celo,
  44787: celoAlfajores,
};

export default function ShowAccountAddress({
  accountAddress,
  owner,
  config,
}: {
  accountAddress: string;
  owner: string;
  config: any;
}) {
  const [profile] = useProfile(config.community.alias, owner);
  const avatarUrl = profile ? getUrlFromIPFS(profile.image_medium) : "/nfcwallet-icon.jpg";

  const publicClient = createPublicClient({
    chain: chains[config.node.chain_id],
    transport: http(),
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    publicClient,
  });

  const topupPlugin = (config?.plugins || []).find((plugin: any) => plugin.name === "Top Up");

  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="max-w-xl mx-auto">
        <div className="text-center my-8">
          {profile && <h1>{profile.name}</h1>}
          {!profile && config?.community.name && <h1>{config.community.name}</h1>}
          <Address address={accountAddress} format="short" className="justify-center my-2" />
        </div>
        <div className="flex flex-row my-14">
          <div className="w-1/2">{avatarUrl && <Image src={avatarUrl} alt="avatar" width="300" height="300" />}</div>
          <div className="w-1/2">
            {accountAddress && (
              <QRCode value={accountAddress} size={256} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
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
        {topupPlugin && typeof window !== "undefined" && (
          <div className="text-center pt-8 my-8">
            <Link
              className="bouton"
              href={`${topupPlugin.url}?account=${accountAddress}&redirectUrl=${encodeURIComponent(
                window.location.href,
              )}`}
            >
              Top Up
            </Link>
          </div>
        )}
      </div>
    </WagmiConfig>
  );
}
