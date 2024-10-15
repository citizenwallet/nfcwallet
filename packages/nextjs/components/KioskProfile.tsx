"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KioskPreviewBadges from "./KioskPreviewBadges";
import EditProfileQRModal from "@/components/EditProfileQRModal";
import KioskProfileHeader from "@/components/KioskProfileHeader";
import MintCommunityToken from "@/components/MintCommunityToken";
import { Poap } from "@/lib/poap";
import EditProfileIcon from "@/public/editProfileIcon.svg";
import LogoutIcon from "@/public/logout.svg";
import { useSafeEffect } from "@citizenwallet/sdk";
import QRCode from "react-qr-code";
import { createPublicClient, http } from "viem";
import { WagmiConfig, createConfig } from "wagmi";
import CWTokenBalance from "~~/components/CWTokenBalance";
import { useProfile } from "~~/hooks/citizenwallet";
import chains from "~~/lib/chains";
import { hexToRgba } from "~~/lib/colors";
import QRCodeIcon from "~~/public/qrcode.svg";

const INACTIVITY_TIMEOUT_SECONDS = 30;

export default function KioskProfile({
  accounts,
  config,
  secondConfig,
  theme,
  poap,
  onLogout,
  redirectUrl,
}: {
  accounts: string[];
  config: any;
  secondConfig?: any;
  theme: any;
  poap?: Poap;
  onLogout?: () => void;
  redirectUrl?: string;
}) {
  const communitySlug = config?.community.alias;
  const accountAddress = accounts[0];
  const [profile] = useProfile(communitySlug, accountAddress);
  const [showProfileQR, setShowProfileQR] = useState(false);
  const [timeleft, setTimeLeft] = useState(INACTIVITY_TIMEOUT_SECONDS);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showMintCommunityTokenModal, setShowMintCommunityTokenModal] = useState(false);
  const router = useRouter();

  const logout = useCallback(() => {
    if (onLogout) {
      onLogout();
    }
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  }, [onLogout, redirectUrl, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prevTimeLeft => {
        if (prevTimeLeft === 1) {
          clearInterval(interval);
          logout();
          return 0; // Reset to 0 or could be set to INACTIVITY_TIMEOUT_SECONDS if you want to restart the timer
        }
        return prevTimeLeft - 1;
      });
    }, 1000);

    // Cleanup on component unmount
    return () => clearInterval(interval);
  }, [logout, timeleft]); // Empty dependency array ensures this effect runs only once on mount

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

  const toggleProfileQR = () => {
    resetTimeout();
    setShowProfileQR(!showProfileQR);
  };
  const toggleEditProfileModal = () => {
    resetTimeout();
    setShowEditProfileModal(!showEditProfileModal);
  };
  const toggleShowMintCommunityTokenModal = () => {
    resetTimeout();
    setShowMintCommunityTokenModal(!showMintCommunityTokenModal);
  };

  const profilePageUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/${communitySlug}/${accounts.join(",")}`;

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

        <KioskProfileHeader greeting={`Hey, ${profile?.name || "regen"}!`} profile={profile} config={config} />

        {accountAddress && showEditProfileModal && (
          <EditProfileQRModal
            theme={theme}
            editProfileUrl={`${profilePageUrl}/edit`}
            onClose={toggleEditProfileModal}
          />
        )}
        {accountAddress && showMintCommunityTokenModal && (
          <MintCommunityToken
            theme={theme}
            accountAddress={accountAddress}
            amount={3}
            description="3h shift"
            config={config}
            profile={profile}
            onMinted={toggleShowMintCommunityTokenModal}
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

        <div className="mb-8 flex flex-col gap-2 max-w-sm mx-auto">
          {config?.token.address && <CWTokenBalance config={config} accountAddress={accounts[0]} />}
          {secondConfig && accounts.length > 1 && (
            <CWTokenBalance
              config={secondConfig}
              accountAddress={accounts[1].replace(`@${secondConfig.community.alias}`, "")}
            />
          )}
        </div>

        {hasPlugin("poap") && (
          <div className="mb-8 mx-auto">
            <KioskPreviewBadges
              title="POAPs collected"
              theme={theme}
              limit={10}
              profile={profile}
              poapToClaim={poap}
              accountAddress={accountAddress}
            />
          </div>
        )}
        {/* <Actions theme={theme} config={config} /> */}

        <div className="flex justify-center text-sm my-8 pb-4 px-16 flex-col gap-8">
          {/* <button
            className="bg-[#195245] active:bg-[#01392C] border-2 border-[#1E6756] color-[#F8F7F3] h-32 w-full rounded-2xl text-center font-bold text-4xl"
            onClick={toggleShowMintCommunityTokenModal}
          >
            <div className="flex flex-row gap-6 justify-center">
              <RecordShiftIcon />
              <span>Record a shift</span>
            </div>
          </button> */}
          <button
            style={{ backgroundColor: hexToRgba(theme.primary, 0.1) }}
            className="active:opacity-70 border-2 h-32 w-full rounded-2xl text-center font-bold text-4xl"
            onClick={toggleEditProfileModal}
          >
            <div className="flex flex-row gap-6 justify-center">
              <EditProfileIcon />
              <span>Edit profile</span>
            </div>
          </button>

          <button
            style={{ backgroundColor: hexToRgba(theme.primary, 0.1) }}
            className="active:opacity-79 border-2  h-32 w-full rounded-2xl text-center font-bold text-4xl"
            onClick={logout}
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
