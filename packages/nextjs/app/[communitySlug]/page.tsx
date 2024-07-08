"use client";

import CommunityCardReader from "~~/components/CommunityCardReader";

export default function NFCScanner({ params }: { params: { communitySlug: string } }) {
  if (params.communitySlug === "favicon.ico") {
    return null;
  }

  return (
    <div className="bg-gray-800 w-full min-h-screen text-white p-0 m-0">
      <CommunityCardReader communitySlug={params.communitySlug} />
    </div>
  );
}
