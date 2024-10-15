import { useState } from "react";
import Image from "next/image";
import { Config } from "@citizenwallet/sdk";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { Theme, darkenHexColor } from "~~/lib/colors";
import DefaultAvatar from "~~/public/avatar.svg";

export default function MintCommunityToken({
  accountAddress,
  config,
  amount,
  description,
  theme,
  profile,
  onMinted,
}: {
  accountAddress: string;
  config: Config;
  amount?: number;
  description?: string;
  theme: Theme;
  profile: any;
  onMinted: (data: any) => void;
}) {
  const [status, setStatus] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  async function mintCommunityToken() {
    if (status === "minting") {
      return;
    }
    setStatus("minting");
    console.log(">>> minting ", amount, config.token.symbol, "for", accountAddress);
    const res = await fetch(`/api/token/mint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ communitySlug: config.community.alias, address: accountAddress, amount, description }),
    });
    const data = await res.json();
    console.log(">>> POST /api/token/mint response", data);
    onMinted(data);
    setStatus("minted");
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  }

  if (status === "minted" && !showConfetti) return <></>;

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
        <Image src={config.community.logo} alt={config.token.name} width={250} height={250} className="mx-auto my-8" />
        <div className="px-16 w-full mt-6">
          {status === "minted" ? (
            <h2 className="text-4xl font-bold text-center">Minted!</h2>
          ) : (
            <button
              className="rounded-xl mt-4 h-20 px-6 font-bold bg-white bg-opacity-[0.08] active:bg-opacity-[0.04] text-4xl"
              style={{ color: theme.primary }}
              onClick={mintCommunityToken}
              disabled={status === "minting"}
            >
              {status === "minting" ? "minting..." : `Mint ${amount} tokens`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
