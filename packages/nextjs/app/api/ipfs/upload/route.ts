import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const headersList = headers();
  const host = headersList.get("host");
  const referer = headersList.get("referer");

  if (!referer?.includes(host || "")) {
    return Response.json({ error: "Unauthorized" });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  const pinataMetadata = JSON.stringify({
    name: file.name,
  });
  formData.append("pinataMetadata", pinataMetadata);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
    body: formData,
  });
  const resData = await res.json();

  return Response.json({ ipfsHash: resData.IpfsHash });
}
