"use client";

import React, { useEffect, useState } from "react";
import DiscordChannel from "./DiscordChannel";
import KioskProfile from "./KioskProfile";
import NFCReader from "@/components/NFCReaderSmall";
import { Poap } from "@/lib/poap";
import moment from "moment";
import { getCardAccountAddress } from "~~/hooks/citizenwallet";
import { Theme } from "~~/lib/colors";

export default function CommunityKiosk({
  config,
  secondConfig,
  communitySlug,
  poap,
  theme,
}: {
  config: any;
  secondConfig: any;
  communitySlug: string;
  poap: Poap | undefined;
  theme: Theme;
}) {
  const [writing, setWriting] = useState<boolean>(false);
  const [nfcReaderState, setNFCReaderState] = useState<string>("scanning"); // "idle" by default
  const [accounts, setAccounts] = useState<string | null>(null);

  const handleNFCData = async ({ message, serialNumber }: { message: any; serialNumber: string }) => {
    if (writing) return;
    const textDecoder = new TextDecoder();
    let accounts_str = null;
    let urlstr = null;
    for (const record of message.records) {
      if (record.recordType === "url") {
        urlstr = textDecoder.decode(record.data);
        console.log("NFC card current url:", urlstr);

        const lastToken = urlstr.split("/").pop();
        if (lastToken?.substring(0, 2) === "0x" && lastToken.length >= 42) {
          accounts_str = lastToken;
          if (communitySlug === "wallet.commonshub.brussels" && (accounts_str || "").indexOf(",") === -1) {
            setupCard(accounts_str, urlstr);
          } else {
            setAccounts(accounts_str);
            return;
          }
        }
      }
    }
    if (!accounts_str || (communitySlug === "wallet.commonshub.brussels" && (accounts_str || "").indexOf(",") === -1)) {
      accounts_str = await getCardAccountAddress(communitySlug, serialNumber);
      if (communitySlug === "wallet.commonshub.brussels") {
        accounts_str += `,${await getCardAccountAddress("wallet.pay.brussels", serialNumber)}@wallet.pay.brussels`;
      }
      console.log("computed crypto wallet address for", communitySlug, serialNumber, accounts_str);
    }
    setupCard(accounts_str, urlstr);
  };

  const setupCard = async (accounts: any, urlstr: string | null) => {
    if (!accounts) {
      console.error("Account address is required");
      return null;
    }
    const newurlstr = `https://nfcwallet.xyz/${communitySlug}/${accounts}`;
    if (urlstr && urlstr === newurlstr) {
      setAccounts(accounts);
    }
    setWriting(true);
    console.log("setupCard, writing", newurlstr);
    try {
      const ndef = new NDEFReader();
      await ndef.write({
        records: [{ recordType: "url", data: newurlstr }],
      });
      console.log("Card set up successfully!", newurlstr);
      setAccounts(accounts);
    } catch (error) {
      setWriting(false);
      console.error("Write failed :-( try again.", error);
      setTimeout(() => {
        setAccounts(null);
      }, 3000);
    }
    setWriting(false);
  };

  useEffect(() => {
    // for easy testing
    // @ts-ignore
    window.setAccount = (address: string) => setAccounts(address);
  }, []);

  if (accounts) {
    console.log(">>> card account address", accounts);
  }

  const onLogout = () => {
    setAccounts(null);
    setNFCReaderState("scanning");
  };

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      {!accounts && (
        <div>
          <div className="flex flex-row justify-between p-4">
            <div>
              <div className="text-xl">{moment(now).format("MMMM Do")}</div>
              <div className="text-3xl font-bold">{moment(now).format("HH:mm")}</div>
            </div>
            <div className="">
              <NFCReader theme={theme} onChange={handleNFCData} isWriting={writing} state={nfcReaderState} />
            </div>
          </div>
          <div className="flex items-center flex-col">
            <h1 className="text-4xl mt-8">Latest contributions to the Commons Hub</h1>
            <div className="text-left p-4">
              <DiscordChannel channelId={"1297965144579637248"} />
              <h2 className="text-center">
                Join the #contributions channel to share your contributions (discord.commonshub.brussels)
              </h2>
            </div>
          </div>
        </div>
      )}
      {accounts && (
        <KioskProfile
          config={config}
          secondConfig={secondConfig}
          accounts={accounts.split(",")}
          theme={theme}
          poap={poap}
          onLogout={onLogout}
        />
      )}
    </div>
  );
}
