import React from "react";
import Error from "@/components/Error";
import ClaimPoap from "@/containers/ClaimPoap";

export default async function ClaimPoapPage({ params }: { params: { hash: string } }) {
  // const [urlRecord, setUrlRecord] = useState("");
  const { hash } = params;
  if (hash.length !== 6) {
    return <Error msg="Invalid POAP hash" />;
  }

  return (
    <div>
      <ClaimPoap hash={hash} />
    </div>
  );
}
