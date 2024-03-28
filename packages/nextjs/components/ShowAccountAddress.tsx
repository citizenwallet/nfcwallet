"use client";

import Image from "next/image";
import QRCode from "react-qr-code";
import { Address, TokenBalance } from "~~/components/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { getHash } from "~~/utils/crypto";

interface Profile {
  user: {
    name: string;
    avatar?: {
      fullUrl: string;
    };
  };
}

export default function ShowAccountAddress({ serialNumber, profile }: { serialNumber: string; profile?: Profile }) {
  const hash = getHash(
    serialNumber,
    BigInt(process.env.NEXT_PUBLIC_CHAIN_ID || 0),
    process.env.NEXT_PUBLIC_CARDMANAGER_CONTRACT_ADDRESS || "",
  );

  const { data: accountAddress } = useScaffoldContractRead({
    contractName: "CardManager",
    functionName: "getCardAddress",
    args: [hash as `0x${string}`],
  });

  const avatarUrl = profile?.user?.avatar ? profile.user.avatar.fullUrl : "/nfcwallet-icon.jpg";

  return (
    <div>
      <div className="text-center my-8">
        {profile?.user && <h1>{profile.user.name}</h1>}
        <Address address={accountAddress} format="short" className="justify-center my-2" />
      </div>
      <div className="flex flex-row my-14">
        <div className="w-1/2">{avatarUrl && <Image src={avatarUrl} alt="avatar" width="300" height="300" />}</div>
        <div className="w-1/2">
          {accountAddress && (
            <QRCode value={accountAddress} size={256} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
          )}
        </div>
      </div>
      {process.env.NEXT_PUBLIC_TOKEN_ADDRESS && (
        <TokenBalance
          address={accountAddress}
          symbol="USDC"
          precision={2}
          tokenAddress={process.env.NEXT_PUBLIC_TOKEN_ADDRESS}
          className="justify-center my-2"
        />
      )}
      {process.env.NEXT_PUBLIC_TOKEN_ADDRESS2 && (
        <TokenBalance
          address={accountAddress}
          symbol="🍺"
          precision={0}
          tokenAddress={process.env.NEXT_PUBLIC_TOKEN_ADDRESS2}
          className="justify-center my-2"
        />
      )}
    </div>
  );
}
