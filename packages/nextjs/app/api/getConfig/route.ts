export async function GET() {
  const response = await fetch("https://config.internal.citizenwallet.xyz/v3/communities.json");
  const data = await response.json();
  return Response.json(data);
}
