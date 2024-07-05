import { useState } from "react";
import Image from "next/image";
import { Poap } from "@/lib/poap";
import { pickRandom } from "@/lib/utils";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { useGetEvent } from "~~/hooks/usePoap";
import DefaultAvatar from "~~/public/avatar.svg";

export default function ClaimPoapModal({
  accountAddress,
  poap,
  theme,
  profile,
}: {
  accountAddress: string;
  poap: Poap;
  theme: any;
  profile: any;
}) {
  const { data, isLoading } = useGetEvent(poap.id);
  const [claimed, setClaimed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  console.log(">>> poap:useGetEvent data", data);

  async function getPoapSecret(hash: string) {
    try {
      const res = await fetch(`/api/poap/claim/${hash}`);
      const data = await res.json();
      console.log(">>> getPoapSecret", poap.id, "response", data);
      return data.secret;
    } catch (e) {
      console.error("getPoapSecret error", e);
      return null;
    }
  }
  async function claimPoapNow() {
    console.log(">>> Claiming POAP", poap.id, "for", accountAddress);
    const randomPoap = pickRandom(poap.hashes.filter(h => !h.claimed));
    console.log(">>> Random POAP", randomPoap);
    const secret = await getPoapSecret(randomPoap.qr_hash);
    if (!secret) return null;
    const res = await fetch(`/api/poap/claim/${randomPoap.qr_hash}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: accountAddress, secret }),
    });
    const data = await res.json();
    console.log(">>> POST ClaimPoap data", data);
    setClaimed(true);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  }

  if (isLoading) return <></>;
  if (claimed && !showConfetti) return <></>;

  return (
    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundColor: theme.secondary }}>
      {showConfetti && <Confetti width={width} height={height} />}
      <div className="w-full h-36 flex justify-center items-end flex-col mt-8">
        {profile?.image_url && (
          <Image src={profile?.image_url} alt="avatar" width="80" height="80" className="rounded-full mx-auto" />
        )}
        {!profile?.image_url && <DefaultAvatar className="w-20 h-20 mx-auto" />}
        <h1 className="w-full text-center text-xl p-0 my-4 font-bold">Welcome, {profile?.name || "regen"}</h1>
      </div>
      <div className="flex justify-center items-center flex-col">
        <Image src={data?.image_url} alt={data?.name} width={500} height={500} className="mx-auto my-8" />
        <div className="px-16 w-full mt-8">
          {claimed ? (
            <h2 className="text-4xl font-bold text-center">Claimed!</h2>
          ) : (
            <button
              className="bg-[#195245] active:bg-[#01392C] border-2 border-[#1E6756] color-[#F8F7F3] h-32 w-full rounded-2xl text-center font-bold text-4xl"
              onClick={claimPoapNow}
            >
              Claim your POAP of the day
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
