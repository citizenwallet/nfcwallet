export async function GET() {
  const response = await fetch(
    `https://config.internal.citizenwallet.xyz/v3/communities.json?cache=${Math.round(new Date().getTime() / 10000)}`,
  );
  const data = await response.json();
  return Response.json(data);
}
