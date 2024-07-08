"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import NFCReader from "@/components/NFCReader";
import { getCardAccountAddress } from "~~/hooks/citizenwallet";

export default function CommunityCardReader({ communitySlug }: { communitySlug: string }) {
  const [serialNumber, setSerialNumber] = useState("");
  const [writing, setWriting] = useState(false);
  const [status, setStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
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
    setSerialNumber(serialNumber);
    const accountAddress = await getCardAccountAddress(communitySlug, serialNumber);
    setAccountAddress(accountAddress);
  };

  const setupCard = async () => {
    if (!accountAddress) {
      setErrorMsg("Account address is required");
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
      setStatus("Card set up successfully!");
      setTimeout(() => {
        setStatus("");
        setSerialNumber("");
        setCardUrl(null);
        setAccountAddress(null);
      }, 2000);
      // return router.push(urlstr);
    } catch {
      setWriting(false);
      console.log("Write failed :-( try again.");
      setErrorMsg("Write failed :-( try again.");
      setTimeout(() => {
        setCardUrl(null);
        setErrorMsg("");
      }, 3000);
    }
    setWriting(false);
  };

  if (accountAddress) {
    console.log(">>> card account address", accountAddress);
  }

  return (
    <div>
      <Image src="/nfcwallet-logo.png" alt="NFC Wallet" width="300" height="124" className={`mx-auto py-10`} />

      {/* <p>Serial Number: {serialNumber}</p> */}
      <NFCReader onChange={handleNFCData} />
      {serialNumber && accountAddress && (
        <div className="p-4 text-center">
          <p>
            Card Account Address: <span className="text-xs">{accountAddress}</span>
          </p>
          <button className="button btn-primary" onClick={setupCard}>
            {cardUrl ? "Go to wallet" : "Set Up Card"}
          </button>
          {status && <p>{status}</p>}
          {errorMsg && <p>{errorMsg}</p>}
        </div>
      )}
    </div>
  );
}
