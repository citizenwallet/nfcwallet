"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PreviewAccountBadges from "./PreviewAccountBadges";
import EditProfileQRModal from "@/components/EditProfileQRModal";
import KioskProfileHeader from "@/components/KioskProfileHeader";
import PoapOfTheDay from "@/components/PoapOfTheDay";
import { TokenBalance } from "@/components/scaffold-eth";
import { Poap } from "@/lib/poap";
import EditProfileIcon from "@/public/editProfileIcon.svg";
import LogoutIcon from "@/public/logout.svg";
import { useSafeEffect } from "@citizenwallet/sdk";
import QRCode from "react-qr-code";
import { createPublicClient, http } from "viem";
import { WagmiConfig, createConfig } from "wagmi";
import { useProfile } from "~~/hooks/citizenwallet";
import chains from "~~/lib/chains";
import { hexToRgba } from "~~/lib/colors";
import QRCodeIcon from "~~/public/qrcode.svg";

const INACTIVITY_TIMEOUT_SECONDS = 30;

export default function KioskProfile({
  accountAddress,
  config,
  theme,
  poap,
  onLogout,
}: {
  accountAddress: string;
  config: any;
  theme: any;
  poap: Poap | undefined;
  onLogout: () => void;
}) {
  const communitySlug = config?.community.alias;
  const [profile] = useProfile(communitySlug, accountAddress);
  const [showProfileQR, setShowProfileQR] = useState(false);
  const [timeleft, setTimeLeft] = useState(INACTIVITY_TIMEOUT_SECONDS);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  useEffect(() => {
    console.log(">>> SETTING INTERVAL", timeleft, INACTIVITY_TIMEOUT_SECONDS);
    const interval = setInterval(() => {
      setTimeLeft(prevTimeLeft => {
        if (prevTimeLeft === 1) {
          clearInterval(interval);
          onLogout();
          return 0; // Reset to 0 or could be set to INACTIVITY_TIMEOUT_SECONDS if you want to restart the timer
        }
        return prevTimeLeft - 1;
      });
    }, 1000);

    // Cleanup on component unmount
    return () => clearInterval(interval);
  }, [onLogout, timeleft]); // Empty dependency array ensures this effect runs only once on mount

  useSafeEffect(() => {
    window.localStorage.setItem("communitySlug", config.community.alias);
  }, []);

  function resetTimeout() {
    setTimeLeft(INACTIVITY_TIMEOUT_SECONDS);
  }

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

  const toggleProfileQR = () => {
    resetTimeout();
    setShowProfileQR(!showProfileQR);
  };
  const toggleEditProfileModal = () => {
    resetTimeout();
    setShowEditProfileModal(!showEditProfileModal);
  };

  const profilePageUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/${communitySlug}/${accountAddress}`;

  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="w-full min-h-screen mx-auto relative overflow-hidden contrast-125">
        <QRCodeIcon
          width="40"
          height="40"
          onClick={toggleProfileQR}
          className="absolute right-6 top-6"
          style={{ color: config.community.theme.primary }}
        />

        {poap?.id && <PoapOfTheDay accountAddress={accountAddress} poap={poap} profile={profile} theme={theme} />}

        <KioskProfileHeader greeting={`Hey, ${profile?.name || "regen"}!`} profile={profile} config={config} />

        {accountAddress && showEditProfileModal && (
          <EditProfileQRModal
            theme={theme}
            editProfileUrl={`${profilePageUrl}/edit`}
            onClose={toggleEditProfileModal}
          />
        )}
        {accountAddress && showProfileQR && (
          <div>
            <div
              className="w-fit mx-auto my-4 flex justify-center items-center bg-white p-4 rounded-2xl"
              onClick={toggleProfileQR}
            >
              <QRCode value={profilePageUrl} size={256} style={{ height: "auto", maxWidth: "300px", width: "100%" }} />
            </div>
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
            ></Link>
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

        <div className="flex justify-center text-sm my-8 pb-4 px-16 flex-col gap-8">
          <button
            className="bg-[#195245] active:bg-[#01392C] border-2 border-[#1E6756] color-[#F8F7F3] h-32 w-full rounded-2xl text-center font-bold text-4xl"
            onClick={toggleEditProfileModal}
          >
            <div className="flex flex-row gap-6 justify-center">
              <EditProfileIcon />
              <span>Edit profile</span>
            </div>
          </button>

          <button
            className="bg-[#195245] active:bg-[#01392C] border-2 border-[#1E6756] color-[#F8F7F3] h-32 w-full rounded-2xl text-center font-bold text-4xl"
            onClick={onLogout}
          >
            <div className="flex flex-row justify-center items-center">
              <LogoutIcon width={40} height={40} className="mr-6" />
              <span>Log out</span>
              <div className=" w-20 flex-shrink-0 ml-1">({timeleft})</div>
            </div>
          </button>
        </div>
      </div>
    </WagmiConfig>
  );
}
