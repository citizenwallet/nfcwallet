"use client";

import CommunityCardReader from "~~/components/CommunityCardReader";

export default function NFCScanner({ params }: { params: { communitySlug: string } }) {
  return (
    <div>
      <CommunityCardReader communitySlug={params.communitySlug} />
    </div>
  );
}
