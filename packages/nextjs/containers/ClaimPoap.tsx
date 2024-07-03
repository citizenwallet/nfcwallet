"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSafeEffect } from "@citizenwallet/sdk";

export default function ClaimPoap({ hash }: { hash: string }) {
  const [error, setError] = useState<string | null>("");
  const [account, setAccount] = useState<string | null>("");
  const [communitySlug, setCommunitySlug] = useState<string | null>("");
  const router = useRouter();
  useSafeEffect(() => {
    const account = window.localStorage.getItem("account");
    const communitySlug = window.localStorage.getItem("communitySlug");
    setCommunitySlug(communitySlug);
    setAccount(account);
  }, []);

  async function claimPoap(hash: string, account: string | null) {
    console.log(">>> claiming", hash, "to", account);
    if (!account) {
      setError("No account found");
    }
    const url = `/api/poap/claim/${hash}`;
    let secret;
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log(">>> data received", data);
      secret = data.secret;
    } catch (e) {
      console.error("Error:", e);
      return;
    }

    // Claim the POAP
    const body = JSON.stringify({
      sendEmail: true,
      address: account,
      qr_hash: hash,
      secret,
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (data.error) {
        console.error("Error claiming POAP:", data.error);
        setError(data.message || data.error);
        return;
      }
      console.log(">>> claimed", data);
      router.push(`/${communitySlug}/${account}/badges?claimed=${hash}`);
    } catch (e) {
      console.error("Error:", e);
      return;
    }
  }

  return (
    <div>
      Claiming {hash} to {account}...
      <button className="btn btn-secondary w-full max-w-sm" onClick={() => claimPoap(hash, account)}>
        Claim
      </button>
      {error && <div className="text-red font-bold text-center max-w-lg mx-auto my-8">{error}</div>}
    </div>
  );
}
