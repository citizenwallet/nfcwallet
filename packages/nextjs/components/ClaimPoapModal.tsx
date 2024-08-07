import { useEffect, useState } from "react";
import Image from "next/image";
import { Poap } from "@/lib/poap";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { useGetEvent } from "~~/hooks/usePoap";
import { Theme, darkenHexColor } from "~~/lib/colors";
import DefaultAvatar from "~~/public/avatar.svg";

export default function ClaimPoapModal({
  accountAddress,
  poap,
  theme,
  profile,
  onClaimed,
}: {
  accountAddress: string;
  poap: Poap;
  theme: Theme;
  profile: any;
  onClaimed: (data: any) => void;
}) {
  const { data, isLoading } = useGetEvent(poap.id);
  const [status, setStatus] = useState("");
  const [poapHashToClaim, setPoapHashToClaim] = useState({ hash: "", secret: "" });
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const prepareClaim = async () => {
      const res = await fetch(`/api/poap/event/${poap.id}/getHash`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Accept-Type": "application/json",
        },
      });

      const selectedPoapHash = await res.json();
      if (!selectedPoapHash) {
        console.error(">>> No POAP hashes available to claim");
        return;
      }
      setPoapHashToClaim(selectedPoapHash);
    };
    prepareClaim();
  }, [setPoapHashToClaim, poap]);

  async function claimPoapNow() {
    setStatus("claiming");
    if (!poapHashToClaim) return null;
    console.log(">>> Claiming POAP", poap.id, "for", accountAddress);
    const res = await fetch(`/api/poap/claim/${poapHashToClaim.hash}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: accountAddress, secret: poapHashToClaim.secret }),
    });
    const data = await res.json();
    console.log(">>> POST ClaimPoap data", data);
    onClaimed(data);
    setStatus("claimed");
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  }

  if (isLoading) return <></>;
  if (status === "claimed" && !showConfetti) return <></>;

  return (
    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundColor: darkenHexColor(theme.primary, 70) }}>
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
        <div className="px-16 w-full mt-6">
          {status === "claimed" ? (
            <h2 className="text-4xl font-bold text-center">Claimed!</h2>
          ) : (
            <button
              className="rounded-xl mt-4 h-20 px-6 text-[#1CB260] font-bold bg-white bg-opacity-[0.08] active:bg-opacity-[0.04] text-4xl"
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
