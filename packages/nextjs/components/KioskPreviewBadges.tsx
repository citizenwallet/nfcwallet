"use client";

import { useState } from "react";
import Image from "next/image";
import PoapOfTheDay from "@/components/PoapOfTheDay";
import { Poap } from "@/lib/poap";
import { usePoaps } from "~~/hooks/usePoap";

export default function KioskPreviewBadges({
  accountAddress,
  limit,
  profile,
  title,
  poapToClaim,
  theme,
}: {
  accountAddress: string;
  limit?: number;
  profile: any;
  title: string;
  poapToClaim?: Poap | undefined;
  theme: any;
}) {
  const { data: poaps } = usePoaps(profile?.ownerAddress || accountAddress, limit);
  const [claimedPoap, setClaimedPoap] = useState(undefined);

  const onPoapClaimed = poapData => {
    setClaimedPoap(poapData);
  };

  return (
    <div>
      {poapToClaim?.id && (
        <PoapOfTheDay
          accountAddress={accountAddress}
          poap={poapToClaim}
          profile={profile}
          theme={theme}
          onClaimed={onPoapClaimed}
        />
      )}
      {title && poaps && poaps.length > 0 && <h2 className="text-[#4C8477] font-bold text-center text-xl">{title}</h2>}
      <div className="w-fit mx-auto overflow-x-auto whitespace-nowrap max-w-full box-border scroll-smooth">
        {claimedPoap && (
          <div key={claimedPoap.tokenId} className="inline-block rounded-full overflow-hidden my-2 mx-2">
            <Image
              src={`${claimedPoap.event?.image_url}?size=small`}
              width={120}
              height={120}
              alt={claimedPoap.event?.name}
            />
          </div>
        )}
        {poaps &&
          poaps.length > 0 &&
          poaps.map(
            poap =>
              poap.tokenId != claimedPoap?.tokenId && (
                <div key={poap.tokenId} className="inline-block rounded-full overflow-hidden my-2 mx-2">
                  <Image src={`${poap.event.image_url}?size=small`} width={120} height={120} alt={poap.event.name} />
                </div>
              ),
          )}
      </div>
    </div>
  );
}
