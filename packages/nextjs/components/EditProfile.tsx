"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditAvatar from "./EditAvatar";
import { defaults } from "lodash";
import { createPublicClient, http } from "viem";
import { WagmiConfig, createConfig } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useProfile } from "~~/hooks/citizenwallet";
import chains from "~~/lib/chains";
import { getPasswordHash } from "~~/utils/crypto";
import { getUrlFromIPFS } from "~~/utils/ipfs";

export default function EditProfile({
  accountAddress,
  config,
}: {
  accountAddress: string;
  owner: string;
  config: any;
}) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [profile] = useProfile(config?.community.alias, accountAddress);
  const avatarUrl = profile ? getUrlFromIPFS(profile.image_medium) : "/nfcwallet-icon.jpg";
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    account: accountAddress,
    communitySlug: config.community.alias,
    name: undefined,
    username: undefined,
    description: undefined,
    twitter: undefined,
    telegram: undefined,
    linkedin: undefined,
    instagram: undefined,
    website: undefined,
    password: "",
  });
  if (!config) return null;
  const publicClient = createPublicClient({
    chain: chains[config?.node.chain_id],
    transport: http(),
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    publicClient,
  });

  function handleChange(event: any) {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value.trim() }));
  }

  function handleAvatarChange(images: any) {
    setFormData(prev => ({
      ...prev,
      image: "ipfs://" + images.image,
      image_medium: "ipfs://" + images.image_medium,
      image_small: "ipfs://" + images.image_small,
    }));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSaving(true);
    defaults(formData, profile);
    if (formData.password) {
      formData.password = getPasswordHash(formData.password, config.node.chain_id, config.profile.address);
    }
    console.log(">>> handleSubmit", formData);
    try {
      const res = await fetch(`/api/setProfile?communitySlug=${config.community.alias}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(">>> response data", data);
      if (data.error) {
        console.error("Unable to save profile", data.error);
        setErrorMsg(data.error);
        setSaving(false);
        setTimeout(() => setErrorMsg(null), 5000);
        return false;
      }
      setSaving(false);
      router.push(`/${config.community.alias}/${accountAddress}`);
      return false;
    } catch (e) {
      console.error("Unable to save profile", e);
      setSaving(false);
      return false;
    }
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="max-w-xl mx-auto">
        <h2 className="mt-8 mx-2">Edit profile</h2>
        <form className="p-2 w-full">
          {profile?.password && (
            <label className="form-control w-full max-w-sm">
              <h2 className="text-lg mb-2">🔐 Password protected profile</h2>
              <div className="label">
                <span className="label-text">Password</span>
              </div>
              <input
                name="password"
                onChange={handleChange}
                type="password"
                placeholder=""
                className="input input-bordered w-full max-w-sm"
              />
              <div className="label">
                <span className="label-text-alt">
                  Without the proper password, you won&apos;t be able to edit this profile
                </span>
              </div>
            </label>
          )}
          {profile?.password && formData.password && (
            <div>
              <div className="text-center my-8">
                {profile && <h1>{profile.name}</h1>}
                {!profile && config?.community.name && <h1>{config.community.name}</h1>}
                <Address address={accountAddress} format="short" className="justify-center my-2" />
              </div>
              <div className="flex flex-row my-14">
                <EditAvatar accountAddress={accountAddress} avatarUrl={avatarUrl} onChange={handleAvatarChange} />
              </div>
              <h2 className="text-lg mb-2">👤 About you</h2>
              <label className="form-control w-full max-w-sm">
                <div className="label">
                  <span className="label-text">What&apos;s your name buddy?</span>
                </div>
                <input
                  name="name"
                  onChange={handleChange}
                  type="text"
                  defaultValue={profile?.name}
                  placeholder="Type here"
                  className="input input-bordered w-full max-w-sm"
                />
                <div className="label">
                  <span className="label-text-alt">What people call you</span>
                </div>
              </label>
              <label className="form-control w-full max-w-sm">
                <div className="label">
                  <span className="label-text">Pick a username</span>
                </div>
                <input
                  name="username"
                  onChange={handleChange}
                  type="text"
                  defaultValue={profile?.username}
                  placeholder="Type here"
                  className="input input-bordered w-full max-w-sm"
                />
                <div className="label">
                  <span className="label-text-alt">Something short, sweet and unique</span>
                </div>
              </label>

              <label className="form-control w-full max-w-sm">
                <div className="label">
                  <span className="label-text">A short bio</span>
                </div>
                <textarea
                  name="description"
                  onChange={handleChange}
                  className="textarea textarea-bordered h-24 w-full max-w-sm"
                  defaultValue={profile?.description}
                  placeholder="Bio"
                ></textarea>
                <div className="label">
                  <span className="label-text-alt">Just a few words about who you are</span>
                </div>
              </label>

              <h2 className="text-lg mb-2">🔗 A few links about you</h2>
              <div className="join my-2 w-full max-w-sm">
                <label className="join-item rounded-r-full py-3 px-2 border-white border-2 text-sm text-gray-400">
                  https://twitter.com/
                </label>
                <input
                  type="text"
                  defaultValue={profile?.twitter}
                  name="twitter"
                  onChange={handleChange}
                  className="input input-bordered join-item pl-1 w-full max-w-sm"
                  placeholder="twitter username"
                />
              </div>
              <div className="join my-2 w-full max-w-sm">
                <label className="join-item rounded-r-full py-3 px-2 border-white border-2 text-sm text-gray-400">
                  https://t.me/
                </label>
                <input
                  type="text"
                  defaultValue={profile?.telegram}
                  name="telegram"
                  onChange={handleChange}
                  className="input input-bordered join-item pl-1 w-full max-w-sm"
                  placeholder="telegram username"
                />
              </div>
              <div className="join my-2 w-full max-w-sm">
                <label className="join-item rounded-r-full py-3 px-2 border-white border-2 text-sm text-gray-400">
                  https://linkedin.com/in/
                </label>
                <input
                  name="linkedin"
                  type="text"
                  defaultValue={profile?.linkedin}
                  onChange={handleChange}
                  className="input input-bordered join-item pl-1 w-full max-w-sm"
                  placeholder="linkedin username"
                />
              </div>
              <div className="join my-2 w-full max-w-sm">
                <label className="join-item rounded-r-full py-3 px-2 border-white border-2 text-sm text-gray-400">
                  https://instagram.com/
                </label>
                <input
                  name="instagram"
                  type="text"
                  defaultValue={profile?.instagram}
                  onChange={handleChange}
                  className="input input-bordered join-item pl-1 w-full max-w-sm"
                  placeholder="instagram username"
                />
              </div>

              <div className="join my-2 w-full max-w-sm">
                <label className="join-item rounded-r-full py-3 px-2 border-white border-2 text-sm text-gray-400">
                  https://
                </label>
                <input
                  name="website"
                  type="text"
                  defaultValue={profile?.website}
                  onChange={handleChange}
                  className="input input-bordered join-item pl-1 w-full max-w-sm"
                  placeholder="website url"
                />
              </div>
              {!profile?.password && (
                <label className="form-control w-full max-w-sm">
                  <h2 className="text-lg mb-2">🔐 Protect your profile</h2>
                  <div className="label">
                    <span className="label-text">Set a password</span>
                  </div>
                  <input
                    name="password"
                    onChange={handleChange}
                    type="password"
                    placeholder=""
                    className="input input-bordered w-full max-w-sm"
                  />
                  <div className="label">
                    <span className="label-text-alt">
                      To prevent anyone from scanning your NFC wallet and change your profile
                    </span>
                  </div>
                </label>
              )}
              <div className="my-5 max-w-sm w-full">
                <button
                  onClick={handleSubmit}
                  className={`btn btn-primary w-full max-w-sm ${saving ? "btn-disabled" : ""}`}
                >
                  save profile
                </button>
                {errorMsg && <div className="text-red-500 text-center">{errorMsg}</div>}
              </div>
            </div>
          )}
        </form>
      </div>
    </WagmiConfig>
  );
}
