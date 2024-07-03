import Image from "next/image";
import Link from "next/link";

export default function Plugins({ config, accountAddress }: { config: any; accountAddress: string }) {
  if (!config) return null;
  if (typeof window === "undefined") return null;

  return (
    <>
      {config.plugins.map((plugin: any) => (
        <div key={plugin.name} className="text-center pt-2 my-4">
          <Link
            className="border-2 w-24 h-24 text-center flex flex-col rounded-lg p-2 m-4 mx-auto justify-center"
            style={{ borderColor: config.community.theme.primary }}
            href={`${plugin.url}?account=${accountAddress}&redirectUrl=${encodeURIComponent(window.location.href)}`}
          >
            <div className="text-center flex justify-center">
              <Image src={plugin.icon} alt={plugin.name} className="" width={48} height={48} />
            </div>
            <div className="m-1">{plugin.name}</div>
          </Link>
        </div>
      ))}
    </>
  );
}
