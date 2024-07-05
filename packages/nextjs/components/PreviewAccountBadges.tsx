"use client";

import Image from "next/image";
import Link from "next/link";
import { usePoaps } from "~~/hooks/usePoap";

export default function PreviewAccountBadges({
  accountAddress,
  communitySlug,
  limit,
  title,
}: {
  accountAddress: string;
  communitySlug: string;
  limit?: number;
  title: string;
}) {
  const { data: poaps } = usePoaps(accountAddress, limit);

  return (
    <Link href={`/${communitySlug}/${accountAddress}/badges`}>
      {title && poaps && poaps.length > 0 && <h2 className="text-[#4C8477] font-bold text-center text-xl">{title}</h2>}
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
