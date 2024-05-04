"use client";

import CommunityCardReader from "~~/components/CommunityCardReader";

export default function NFCScanner({ params }: { params: { communitySlug: string } }) {
  if (params.communitySlug === "favicon.ico") {
    return null;
  }

  return (
    <div>
      <CommunityCardReader communitySlug={params.communitySlug} />
    </div>
  );
}
