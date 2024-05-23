import Link from "next/link";

const providers = {
  twitter: { svg: "/providers/twitter.svg", baseUrl: "https://twitter.com", prefix: "@" },
  instagram: {
    svg: "/providers/instagram.svg",
    baseUrl: "https://instagram.com",
    prefix: "@",
  },
  linkedin: {
    svg: "/providers/linkedin.svg",
    baseUrl: "https://linkedin.com/in",
    prefix: "@",
  },
  telegram: {
    svg: "/providers/telegram.svg",
    baseUrl: "https://t.me",
    prefix: "@",
  },
  github: {
    svg: "/providers/github.svg",
    baseUrl: "https://github.com",
    prefix: "@",
  },
  website: { svg: "/providers/internet.svg", baseUrl: "https:/", prefix: "https://" },
};

export default function Linktree({ profile }: { profile: any }) {
  return (
    <div className="flex flex-wrap w-full justify-center">
      {Object.keys(providers).map((provider, key) => {
        if (!profile[provider]) return null;
        return (
          <Link
            key={key}
            href={`${providers[provider].baseUrl}/${profile[provider]}`}
            className="border-2 w-full max-w-md h-18 text-center flex flex-col rounded-lg p-2 m-4"
          >
            <div className="flex items-center py-1 px-3">
              <img src={providers[provider].svg} width={48} height={48} />
              <div className="flex items-center ml-2">
                {providers[provider].prefix}
                {profile[provider]}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
