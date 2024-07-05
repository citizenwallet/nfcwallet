import ClaimPoapModal from "@/components/ClaimPoapModal";
import { useHasPoap } from "@/hooks/usePoap";
import { Poap } from "@/lib/poap";

export default function PoapOfTheDay({
  accountAddress,
  theme,
  profile,
  poap,
}: {
  accountAddress: string;
  theme: any;
  profile: any;
  poap: Poap;
}) {
  console.log(">>> PoapOfTheDay", typeof poap.id, poap.id);

  const { hasPoap, data, isLoading } = useHasPoap(accountAddress, poap.id);

  console.log(">>> ClaimPoap", poap.id);
  console.log(">>> data", data);

  if (isLoading) return <></>;
  if (hasPoap) return <></>;

  return <ClaimPoapModal accountAddress={accountAddress} poap={poap} theme={theme} profile={profile} />;
}
