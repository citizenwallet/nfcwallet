"use client";

import Image from "next/image";
import Link from "next/link";
import { usePoaps } from "~~/hooks/usePoap";

export default function PreviewAccountBadges({
  accountAddress,
  communitySlug,
  limit,
}: {
  accountAddress: string;
  communitySlug: string;
  limit?: number;
}) {
  const { data: poaps } = usePoaps(accountAddress, limit);

  console.log(">>> poaps", poaps);

  return (
    <Link href={`/${communitySlug}/${accountAddress}/badges`}>
      <div className="w-fit mx-auto overflow-x-auto whitespace-nowrap max-w-full box-border scroll-smooth">
        {poaps &&
          poaps.length > 0 &&
          poaps.map(poap => (
            <div key={poap.tokenId} className="inline-block rounded-full overflow-hidden my-2 mx-2">
              <Image src={`${poap.event.image_url}?size=small`} width={80} height={80} alt={poap.event.name} />
            </div>
          ))}
      </div>
    </Link>
  );
}
