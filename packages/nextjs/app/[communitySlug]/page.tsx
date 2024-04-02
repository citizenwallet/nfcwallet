"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import NFCReader from "@/components/NFCReader";
import ShowAccountAddress from "@/components/ShowAccountAddress";
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export default function NFCScanner({ params }: { params: { communitySlug: string } }) {
  const [serialNumber, setSerialNumber] = useState("");
  const router = useRouter();

  const handleNFCData = ({ message, serialNumber }: { message: any; serialNumber: string }) => {
    const textDecoder = new TextDecoder();
    for (const record of message.records) {
      if (record.recordType === "url") {
        const urlstr = textDecoder.decode(record.data);
        return router.push(urlstr);
      }
    }
    setSerialNumber(serialNumber);
  };

  return (
    <div>
      <WagmiConfig config={wagmiConfig}>
        {!serialNumber && (
          <Image
            src="/nfcwallet-logo.png"
            alt="NFC Wallet"
            width="300"
            height="124"
            className={`mx-auto ${serialNumber ? "my-4" : "my-20"}`}
          />
        )}
        <div>
          {/* <p>Serial Number: {serialNumber}</p> */}
          {serialNumber && <ShowAccountAddress communitySlug={params.communitySlug} serialNumber={serialNumber} />}
        </div>
        <NFCReader onChange={handleNFCData} />
      </WagmiConfig>
    </div>
  );
}
