import Link from "next/link";
import SocialIcon from "./SocialIcon";

const providers = {
  twitter: { baseUrl: "https://twitter.com", prefix: "@" },
  instagram: {
    baseUrl: "https://instagram.com",
    prefix: "@",
  },
  linkedin: {
    baseUrl: "https://linkedin.com/in",
    prefix: "@",
  },
  telegram: {
    baseUrl: "https://t.me",
    prefix: "@",
  },
  github: {
    baseUrl: "https://github.com",
    prefix: "@",
  },
  website: { baseUrl: "https:/", prefix: "https://" },
};

export default function Linktree({ profile, theme }: { profile: any; theme: any }) {
  return (
    <div className="flex flex-wrap w-full justify-center">
      {Object.keys(providers).map((provider, key) => {
        if (!profile[provider]) return null;
        return (
          <Link
            key={key}
            href={`${providers[provider].baseUrl}/${profile[provider]}`}
            className="w-full max-w-md h-18 text-center flex flex-col rounded-xl p-2 mx-4 my-2 bg-[#FFCFCF] bg-opacity-10"
          >
            <div
              className="flex justify-center items-center py-1 px-3 font-semibold text-xl"
              style={{ color: theme?.primary }}
            >
              <SocialIcon iconName={provider} className="fill-current h-6 w-8" />
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
