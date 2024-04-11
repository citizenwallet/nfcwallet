"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import NFCReader from "@/components/NFCReader";
import { useCardAccountAddress } from "~~/hooks/citizenwallet";

export default function CommunityCardReader({ communitySlug }: { communitySlug: string }) {
  const [serialNumber, setSerialNumber] = useState("");
  const [writing, setWriting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const [cardAccountAddress] = useCardAccountAddress(communitySlug, serialNumber);

  const handleNFCData = ({ message, serialNumber }: { message: any; serialNumber: string }) => {
    if (writing) return;
    const textDecoder = new TextDecoder();
    for (const record of message.records) {
      if (record.recordType === "url") {
        const urlstr = textDecoder.decode(record.data);
        return router.push(urlstr);
      }
    }
    setSerialNumber(serialNumber);
  };

  const setupCard = async () => {
    setWriting(true);
    try {
      const urlstr = `https://nfcwallet.xyz/${communitySlug}/${cardAccountAddress}`;
      const ndef = new NDEFReader();
      await ndef.write({
        records: [{ recordType: "url", data: urlstr }],
      });
      return router.push(urlstr);
    } catch {
      setWriting(false);
      console.log("Write failed :-( try again.");
      setErrorMsg("Write failed :-( try again.");
      setTimeout(() => {
        setErrorMsg("");
      }, 3000);
    }
    setWriting(false);
  };

  if (cardAccountAddress) {
    console.log(">>> pushing to", `/${communitySlug}/${cardAccountAddress}`);
  }

  return (
    <div>
      {!serialNumber && (
        <Image
          src="/nfcwallet-logo.png"
          alt="NFC Wallet"
          width="300"
          height="124"
          className={`mx-auto ${serialNumber ? "my-4" : "my-20"}`}
        />
      )}
      {/* <p>Serial Number: {serialNumber}</p> */}
      <NFCReader onChange={handleNFCData} />
      {cardAccountAddress && (
        <div>
          <p>Card Account Address: {cardAccountAddress}</p>
          <button className="button btn-primary" onClick={setupCard}>
            Set Up Card
          </button>
          {errorMsg && <p>{errorMsg}</p>}
        </div>
      )}
    </div>
  );
}
