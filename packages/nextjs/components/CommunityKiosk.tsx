"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KioskProfile from "./KioskProfile";
import NFCReaderRegenVillage from "@/components/NFCReaderRegenVillage";
import { Poap } from "@/lib/poap";
import { getCardAccountAddress } from "~~/hooks/citizenwallet";
import DefaultAvatar from "~~/public/avatar.svg";

export default function CommunityKiosk({
  config,
  communitySlug,
  poap,
  theme,
}: {
  config: any;
  communitySlug: string;
  poap: Poap | undefined;
  theme: any;
}) {
  const lastPageReload = new Date().getTime();
  const [writing, setWriting] = useState<boolean>(false);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const router = useRouter();

  const handleNFCData = async ({ message, serialNumber }: { message: any; serialNumber: string }) => {
    if (writing) return;
    setCardUrl(null);
    const textDecoder = new TextDecoder();
    for (const record of message.records) {
      if (record.recordType === "url") {
        const urlstr = textDecoder.decode(record.data);
        console.log("URL:", urlstr);
        setCardUrl(urlstr);
        // return router.push(urlstr);
      }
    }
    const accountAddress = await getCardAccountAddress(communitySlug, serialNumber);
    if (accountAddress) {
      setAccountAddress(accountAddress);
    } else {
      if (cardUrl) {
        console.log(">>> NFC tag not empty: can't set up the card", cardUrl);
      } else {
        setupCard();
      }
    }
  };

  const setupCard = async () => {
    if (!accountAddress) {
      console.error("Account address is required");
      return null;
    }
    if (cardUrl) {
      router.push(cardUrl);
    }
    setWriting(true);
    try {
      const urlstr = `https://nfcwallet.xyz/${communitySlug}/${accountAddress}`;
      const ndef = new NDEFReader();
      await ndef.write({
        records: [{ recordType: "url", data: urlstr }],
      });
      setCardUrl(urlstr);
      console.log("Card set up successfully!", urlstr);
      setTimeout(() => {
        setCardUrl(null);
        setAccountAddress(null);
      }, 2000);
      // return router.push(urlstr);
    } catch {
      setWriting(false);
      console.error("Write failed :-( try again.");
      setTimeout(() => {
        setCardUrl(null);
      }, 3000);
    }
    setWriting(false);
  };

  const updateSoftware = () => {
    if (accountAddress) return; // don't update while someone is using the kiosk
    const d = new Date().getTime();
    if (d - lastPageReload > 1000 * 60 * 5) {
      window.location.reload();
    }
  };

  useEffect(() => {
    // for easy testing
    window.setAccount = (address: string) => setAccountAddress(address);
    console.log(">>> setting up interval to updateSoftware");
    const interval = setInterval(updateSoftware, 1000 * 60 * 5); // every 5 minutes
    return () => clearInterval(interval);
  }, [updateSoftware]);

  if (accountAddress) {
    console.log(">>> card account address", accountAddress);
  }

  const onLogout = () => {
    setAccountAddress(null);
    updateSoftware();
  };

  return (
    <div className="text-center">
      {!accountAddress && (
        <div>
          <DefaultAvatar className="mt-16 w-32 h-32 mx-auto" />
          <h1 className="text-4xl font-bold">Hello, regen!</h1>
          <NFCReaderRegenVillage onChange={handleNFCData} isWriting={writing} />
        </div>
      )}
      {accountAddress && (
        <KioskProfile config={config} accountAddress={accountAddress} theme={theme} poap={poap} onLogout={onLogout} />
      )}
    </div>
  );
}
