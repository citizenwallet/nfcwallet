import ClaimPoapModal from "@/components/ClaimPoapModal";
import { useHasPoap } from "@/hooks/usePoap";
import { Poap } from "@/lib/poap";

export default function PoapOfTheDay({
  accountAddress,
  theme,
  profile,
  poap,
  onClaimed,
}: {
  accountAddress: string;
  theme: any;
  profile: any;
  poap: Poap;
  onClaimed: (data: any) => void;
}) {
  const { hasPoap, isLoading } = useHasPoap(profile?.ownerAddress || accountAddress, poap.id);

  if (isLoading) return <></>;
  if (hasPoap) return <></>;

  return (
    <ClaimPoapModal
      accountAddress={profile?.ownerAddress || accountAddress}
      poap={poap}
      theme={theme}
      profile={profile}
      onClaimed={onClaimed}
    />
  );
}
