import { extractUserFromInjectedJson } from "../../../../utils/scraper";

type paramsType = { profileId: string };

async function fetchProfile(profileId: string) {
  const res = await fetch(`https://ethglobal.com/connect/${profileId}`, {
    headers: {
      cookie: `ethglobal_access_token=${process.env.ETHGLOBAL_ACCESS_TOKEN}`,
    },
    method: "GET",
  });

  const html = await res.text();
  const profile = extractUserFromInjectedJson(html);

  return { profile };
}

export async function GET(request: Request, { params }: { params: paramsType }) {
  const profileId = params.profileId;

  const profile = await fetchProfile(profileId);

  return Response.json(profile);
}
