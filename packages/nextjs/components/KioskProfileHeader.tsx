import Image from "next/image";
import DefaultAvatar from "~~/public/avatar.svg";
import { getUrlFromIPFS } from "~~/utils/ipfs";

export default function KioskProfileHeader({
  greeting,
  profile,
  config,
}: {
  greeting?: string;
  profile: any;
  config: any;
}) {
  const avatarUrl = getUrlFromIPFS(profile?.image_medium);

  return (
    <>
      <div className="text-center w-full h-52 flex justify-center items-end">
        {avatarUrl && <Image src={avatarUrl} alt="avatar" width="160" height="160" className="rounded-full mx-auto" />}
        {!avatarUrl && <DefaultAvatar className="w-40 h-40 mx-auto" />}
      </div>
      <div className="text-center mt-2 mb-8">
        {greeting && <h1 className="text-4xl p-0 my-1 font-bold">{greeting}</h1>}
        {!greeting && profile && <h1 className="text-3xl p-0 my-1 font-bold">{profile.name}</h1>}
        {profile?.description && <h2 className="text-xl my-1 p-0">{profile.description}</h2>}
        {profile?.username && (
          <h3 className="text-xl font-bold my-1 p-0" style={{ color: config.community.theme.primary }}>
            @{profile.username}
          </h3>
        )}
        {!profile && config?.community.name && <h1>{config.community.name}</h1>}
      </div>
    </>
  );
}
