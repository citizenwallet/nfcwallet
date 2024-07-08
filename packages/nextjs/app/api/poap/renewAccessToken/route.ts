import { renewAccessToken } from "@/lib/poap";

export async function GET() {
  const accessToken = await renewAccessToken();
  return Response.json({ accessToken, message: "Renewed access token", date: new Date() });
}
