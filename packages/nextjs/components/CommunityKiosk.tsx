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
  const [writing, setWriting] = useState<boolean>(false);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [nfcReaderState, setNFCReaderState] = useState<string>("idle");
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
          accountAddress = lastToken;
          setAccountAddress(accountAddress);
          setCardUrl(urlstr);
          return;
        }
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

  useEffect(() => {
    // for easy testing
    window.setAccount = (address: string) => setAccountAddress(address);
  }, []);

  if (accountAddress) {
    console.log(">>> card account address", accountAddress);
  }

  const onLogout = () => {
    setAccountAddress(null);
    setNFCReaderState("scanning");
  };

  return (
    <div className="text-center">
      {!accountAddress && (
        <div className="flex items-center flex-col">
          <DefaultAvatar className="mt-16 w-48 h-48 mx-auto" />
          <h1 className="text-6xl font-bold">Hello, regen!</h1>
          <NFCReaderRegenVillage onChange={handleNFCData} isWriting={writing} state={nfcReaderState} />
        </div>
      )}
      {accountAddress && (
        <KioskProfile config={config} accountAddress={accountAddress} theme={theme} poap={poap} onLogout={onLogout} />
      )}
    </div>
  );
}
