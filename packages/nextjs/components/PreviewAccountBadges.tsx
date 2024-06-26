"use client";

import Image from "next/image";
import Link from "next/link";
import { usePoaps } from "~~/hooks/poap";

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

  return (
    <Link href={`/${communitySlug}/${accountAddress}/badges`}>
      <div className="mx-2 flex flex-wrap">
        {poaps &&
          poaps.length > 0 &&
          poaps.map(poap => (
            <div key={poap.tokenId} className="rounded-full overflow-hidden my-2 h-12 w-12 mr-[-15px]">
              <Image src={`${poap.event.image_url}?size=small`} width={48} height={48} alt={poap.event.name} />
            </div>
          ))}
      </div>
    </Link>
  );
}
