"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { getHash } from "~~/utils/crypto";

export default function ShowAccountAddress({
  communitySlug,
  serialNumber,
}: {
  communitySlug: string;
  serialNumber: string;
}) {
  const router = useRouter();

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
  useEffect(() => {
    if (accountAddress) {
      console.log(">>> pushing to", `/${communitySlug}/account/${accountAddress}`);
      router.push(`/${communitySlug}/account/${accountAddress}`);
    }
  }, [accountAddress, communitySlug, router]);
  return null;
}
