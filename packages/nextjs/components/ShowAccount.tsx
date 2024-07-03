"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PreviewAccountBadges from "./PreviewAccountBadges";
import { useSafeEffect } from "@citizenwallet/sdk";
import QRCode from "react-qr-code";
import { createPublicClient, http } from "viem";
import { WagmiConfig, createConfig } from "wagmi";
import Linktree from "~~/components/Linktree";
import { TokenBalance } from "~~/components/scaffold-eth";
import { useProfile } from "~~/hooks/citizenwallet";
import chains from "~~/lib/chains";
import { darkenHexColor, hexToRgba } from "~~/lib/colors";
import DefaultAvatar from "~~/public/avatar.svg";
import PlusIcon from "~~/public/plus.svg";
import QRCodeIcon from "~~/public/qrcode.svg";
import SettingsIcon from "~~/public/settings.svg";
import { getUrlFromIPFS } from "~~/utils/ipfs";

export default function ShowAccount({ accountAddress, config }: { accountAddress: string; config: any }) {
  const communitySlug = config?.community.alias;
  const [profile] = useProfile(communitySlug, accountAddress);
  const [showProfileQR, setShowProfileQR] = useState(false);
  const avatarUrl = getUrlFromIPFS(profile?.image_medium);

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
    if (communitySlug === "wallet.pay.brussels") return true;
    return config.plugins?.includes(plugin);
  };

  const getPlugin = (plugin: string) => {
    return config.plugins.find((p: any) => p.name === plugin);
  };

  const toggleModal = () => {
    setShowProfileQR(!showProfileQR);
  };

  const profilePageUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/${communitySlug}/${accountAddress}`;
  console.log(">>> profile", profile);
  console.log(">>> primary", config.community.theme.primary);
  console.log(">>> darkenHexColor 90", darkenHexColor(config.community.theme.primary, 90));
  console.log(">>> darkenHexColor 10", darkenHexColor(config.community.theme.primary, 10));
  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="max-w-xl mx-auto relative overflow-hidden contrast-125">
        <QRCodeIcon
          width="40"
          height="40"
          onClick={toggleModal}
          className="absolute right-6 top-6"
          style={{ color: config.community.theme.primary }}
        />

        <div className="text-center w-full h-36 flex justify-center items-end">
          {avatarUrl && <Image src={avatarUrl} alt="avatar" width="80" height="80" className="rounded-full mx-auto" />}
          {!avatarUrl && <DefaultAvatar className="w-20 h-20 mx-auto" />}
        </div>
        <div className="text-center mt-2 mb-8">
          {profile && <h1 className="text-xl p-0 my-1 font-bold">{profile.name}</h1>}
          {profile?.description && <h2 className="text-lg my-1 p-0">{profile.description}</h2>}
          {profile?.username && (
            <h3 className="text-base font-bold my-1 p-0" style={{ color: config.community.theme.primary }}>
              @{profile.username}
            </h3>
          )}
          {!profile && config?.community.name && <h1>{config.community.name}</h1>}
        </div>

        {accountAddress && showProfileQR && (
          <div
            className="w-fit mx-auto my-4 flex justify-center items-center bg-white p-4 rounded-2xl"
            onClick={toggleModal}
          >
            <QRCode value={profilePageUrl} size={256} style={{ height: "auto", maxWidth: "300px", width: "100%" }} />
          </div>
        )}

        <div className="mx-4 mb-8 flex flex-row gap-2">
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
          {hasPlugin("topup") && (
            <Link
              href={`${getPlugin("Top Up").url}?account=${accountAddress}&redirectUrl=${encodeURIComponent(
                profilePageUrl,
              )}`}
            >
              <div
                style={{ backgroundColor: hexToRgba(config.community.theme.primary, 0.1) }}
                className="flex-shrink-0 w-16 h-16 text-center rounded-2xl box-border overflow-hidden flex justify-center items-center"
              >
                <PlusIcon />
              </div>
            </Link>
          )}
        </div>

        {hasPlugin("poap") && (
          <div className="mb-8 mx-auto">
            <PreviewAccountBadges limit={10} accountAddress={accountAddress} communitySlug={communitySlug} />
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
