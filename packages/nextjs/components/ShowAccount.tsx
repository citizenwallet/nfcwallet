"use client";

import { useState } from "react";
import Link from "next/link";
import PreviewAccountBadges from "./PreviewAccountBadges";
import Linktree from "@/components/Linktree";
import PoapOfTheDay from "@/components/PoapOfTheDay";
import ProfileHeader from "@/components/ProfileHeader";
import { TokenBalance } from "@/components/scaffold-eth";
import { useSafeEffect } from "@citizenwallet/sdk";
import { Poap } from "@lib/poap";
import QRCode from "react-qr-code";
import { createPublicClient, http } from "viem";
import { WagmiConfig, createConfig } from "wagmi";
import CWTokenBalance from "~~/components/CWTokenBalance";
import { useProfile } from "~~/hooks/citizenwallet";
import chains from "~~/lib/chains";
import { hexToRgba } from "~~/lib/colors";
import QRCodeIcon from "~~/public/qrcode.svg";
import SettingsIcon from "~~/public/settings.svg";

export default function ShowAccount({
  accountAddress,
  config,
  secondConfig,
  theme,
  poap,
}: {
  accountAddress: string;
  config: any;
  secondConfig?: any;
  theme: any;
  poap?: Poap;
}) {
  const communitySlug = config?.community.alias;
  const [profile] = useProfile(communitySlug, accountAddress);
  const [showProfileQR, setShowProfileQR] = useState(false);

  useSafeEffect(() => {
    window.localStorage.setItem("account", accountAddress);
    window.localStorage.setItem("communityslug", config.community.alias);
  });

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
    if (communitySlug === "wallet.regenvillage.brussels" && plugin === "poap") return true;
    if (communitySlug === "wallet.pay.brussels") return true;
    return config.plugins?.includes(plugin);
  };

  const getPlugin = (plugin: string) => {
    return config.plugins?.find((p: any) => p.name === plugin);
  };

  const toggleModal = () => {
    setShowProfileQR(!showProfileQR);
  };

  const profilePageUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/${communitySlug}/${accountAddress}`;

  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="w-full mx-auto relative overflow-hidden contrast-125">
        <QRCodeIcon
          width="40"
          height="40"
          onClick={toggleModal}
          className="absolute right-6 top-6"
          style={{ color: config.community.theme.primary }}
        />

        {poap?.id && <PoapOfTheDay accountAddress={accountAddress} poap={poap} profile={profile} theme={theme} />}

        <ProfileHeader profile={profile} config={config} />

        {accountAddress && showProfileQR && (
          <div
            className="w-fit mx-auto my-4 flex justify-center items-center bg-white p-4 rounded-2xl"
            onClick={toggleModal}
          >
            <QRCode value={profilePageUrl} size={256} style={{ height: "auto", maxWidth: "300px", width: "100%" }} />
          </div>
        )}

        <div className="mb-8 flex flex-col gap-2 max-w-sm mx-auto">
          <div
            style={{ backgroundColor: hexToRgba(config.community.theme.primary, 0.1) }}
            className="w-full text-center rounded-2xl box-border overflow-hidden h-16 items-center flex"
          >
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
          {communitySlug === "wallet.regenvillage.brussels" && secondConfig && (
            <CWTokenBalance config={secondConfig} accountAddress={accountAddress} />
          )}
        </div>

        {hasPlugin("poap") && (
          <div className="mb-8 mx-auto">
            <PreviewAccountBadges
              title="POAPs collected"
              limit={10}
              accountAddress={accountAddress}
              communitySlug={communitySlug}
            />
          </div>
        )}

        <div className="mx-10">{profile && <Linktree profile={profile} theme={config.community.theme} />}</div>
        <div className="flex justify-center text-sm my-8 pb-4">
          <Link href={`/${communitySlug}/${accountAddress}/edit`} className="w-full max-w-sm p-4">
            {!profile && (
              <button className="mx-auto h-10 w-56 flex flex-row justify-center items-center gap-2 rounded-3xl bg-[#184C40] border">
                Edit profile <SettingsIcon className="h-5" />
              </button>
            )}
            {profile && (
              <button
                className="mx-auto h-10 w-56 flex flex-row justify-center items-center gap-2 rounded-3xl bg-[#184C40] border"
                style={{ color: config.community.theme.primary, borderColor: config.community.theme.primary }}
              >
                Edit profile <SettingsIcon className="h-5" />
              </button>
            )}
          </Link>
        </div>
      </div>
    </WagmiConfig>
  );
}
