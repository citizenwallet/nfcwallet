"use client";

import React from "react";
import Image from "next/image";

export default function NFCWalletHome() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-row items-center max-w-lg mx-auto">
        <Image src="/nfcwallet-icon-small.png" alt="NFC Wallet" width="150" height="150" className="mx-auto my-20" />
        <div className="w-full font-bold">
          <h1 className="text-[#290755]">
            NFC<span className="text-[#7B7AB9] ml-1">wallet</span>
          </h1>
          <h2 className="text-lg">Turn any NFC tag into a crypto wallet</h2>
        </div>
      </div>
      <h2>Use cases</h2>
      <ul>
        <li>Events (e.g. ETH Global)</li>
        <li>Co-working / co-living space</li>
        <li>Pay per visit 🚶, coffee ☕, printing 🖨️</li>
        <li>Pay for booking meeting room 🕜</li>
        <li>Library Access Card: keep track of borrowed items 📚</li>
        <li>Any common where members need to share a common finite resource (e.g. earth 🌍)</li>
      </ul>
      <h2>Praise</h2>
      <div className="tweet mx-auto max-w-lg">
        <blockquote className="twitter-tweet">
          <a href={`https://twitter.com/ethglobal/statuses/1769849042694025262`}></a>
        </blockquote>
        <script async={true} src="https://platform.twitter.com/widgets.js"></script>
      </div>
      <h2>Get in touch</h2>
      <p>Would you like to use this tech for your next event or for your community?</p>
      <p>Feel free to reach out</p>
      <ul>
        <li>hello@citizenwallet.xyz</li>
        <li>@citizenwallet on Twitter and Farcaster</li>
      </ul>
      <h2>Contribute</h2>
      👉 <a href="https://github.com/citizenwallet/nfcwallet">github.com/citizenwallet/nfcwallet</a>
    </div>
  );
}
