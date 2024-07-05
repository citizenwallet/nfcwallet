"use client";

import React, { useCallback, useEffect, useState } from "react";
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
    let accountAddress = null;
    for (const record of message.records) {
      if (record.recordType === "url") {
        const urlstr = textDecoder.decode(record.data);
        console.log("URL:", urlstr);
        const lastToken = urlstr.split("/").pop();
        if (lastToken?.substring(0, 2) === "0x" && lastToken.length === 42) {
          setAccountAddress(accountAddress);
          setCardUrl(urlstr);
        }
        // return router.push(urlstr);
      }
    }
    if (!accountAddress) {
      accountAddress = await getCardAccountAddress(communitySlug, serialNumber);
      setupCard(accountAddress);
    }
  };

  const setupCard = async accountAddress => {
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
      setAccountAddress(accountAddress);
      // return router.push(urlstr);
    } catch {
      setWriting(false);
      console.error("Write failed :-( try again.");
      setTimeout(() => {
        setCardUrl(null);
        setAccountAddress(null);
      }, 3000);
    }
    setWriting(false);
  };

  const updateSoftware = useCallback(() => {
    // bad idea as it would require people to press to activate the NFC reader again.
    return;
    // if (accountAddress) return; // don't update while someone is using the kiosk
    // const d = new Date().getTime();
    // if (d - lastPageReload > 1000 * 60 * 5) {
    //   window.location.reload();
    // }
  }, [accountAddress, lastPageReload]);

  useEffect(() => {
    // for easy testing
    window.setAccount = (address: string) => setAccountAddress(address);
    console.log(">>> setting up interval to updateSoftware");
    // const interval = setInterval(updateSoftware, 1000 * 60 * 5); // every 5 minutes
    // return () => clearInterval(interval);
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
        <div className="flex items-center h-screen flex-col">
          <DefaultAvatar className="mt-16 w-48 h-48 mx-auto" />
          <h1 className="text-6xl font-bold">Hello, regen!</h1>
          <NFCReaderRegenVillage onChange={handleNFCData} isWriting={writing} />
        </div>
      )}
      {accountAddress && (
        <KioskProfile config={config} accountAddress={accountAddress} theme={theme} poap={poap} onLogout={onLogout} />
      )}
    </div>
  );
}
