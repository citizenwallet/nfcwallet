"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Authenticate from "./Authenticate";
import EditAvatar from "./EditAvatar";
import { defaults } from "lodash";
import { createPublicClient, http } from "viem";
import { WagmiConfig, createConfig } from "wagmi";
import { setCache, useProfile } from "~~/hooks/citizenwallet";
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
  const communitySlug = config?.community.alias;
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [profile, loading] = useProfile(config?.community.alias, accountAddress);
  const avatarUrl = profile ? getUrlFromIPFS(profile.image_medium) : "/nfcwallet-icon.jpg";
  const [saving, setSaving] = useState(false);
  const [bearer, setBearer] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    account: accountAddress,
    communitySlug,
    name: undefined,
    username: undefined,
    description: undefined,
    twitter: undefined,
    telegram: undefined,
    linkedin: undefined,
    instagram: undefined,
    github: undefined,
    website: undefined,
    password: "",
    ownerAddress: undefined,
  });

  const toggleShowChangePassword = () => {
    setShowChangePassword(!showChangePassword);
  };

  useMemo(() => {
    if (typeof window !== "undefined" && !bearer) {
      const bearer = window.localStorage.getItem(`${communitySlug}-${accountAddress}-bearer`);
      const expiryDate = bearer?.split("-")[0];
      if (expiryDate && parseInt(expiryDate) * 1000 < new Date().getTime()) {
        console.log(">>> bearer expired", bearer, parseInt(expiryDate) * 1000, new Date().getTime());
        window.localStorage.removeItem(`${communitySlug}-${accountAddress}-bearer`);
        setBearer("");
      } else if (bearer) {
        setBearer(bearer);
      }
    }
  }, [bearer, accountAddress, communitySlug]);

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

  async function saveProfile() {
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
          Authentication: `Bearer ${bearer}`,
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
      const cacheKey = `useProfile-${communitySlug}-${accountAddress}`;
      setCache(cacheKey, data.profile);
      router.push(`/${config.community.alias}/${accountAddress}`);
      return false;
    } catch (e) {
      console.error("Unable to save profile", e);
      setErrorMsg(e.message);
      setTimeout(() => setErrorMsg(null), 5000);
      setSaving(false);
      return false;
    }
  }

  function handleAvatarChange(images: any) {
    setFormData(prev => ({
      ...prev,
      image: "ipfs://" + images.image,
      image_medium: "ipfs://" + images.image_medium,
      image_small: "ipfs://" + images.image_small,
    }));
    saveProfile();
  }

  function handleAuthentication(bearer: string) {
    setBearer(bearer);
  }

  async function handleSubmit(e?: any) {
    e?.preventDefault();
    if (showChangePassword && !formData.password) {
      setErrorMsg("Please enter a new password");
      setTimeout(() => setErrorMsg(null), 3000);
      return false;
    }
    if ((!profile || !profile.hashedPassword) && !formData.password) {
      setErrorMsg("Please set a password");
      setTimeout(() => setErrorMsg(null), 3000);
      return false;
    }
    await saveProfile();
  }

  // Request a bearer token to edit this version of the profile
  async function getBearer() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/authenticate?communitySlug=${config.community.alias}`,
      {
        method: "POST",
        body: JSON.stringify({
          account: accountAddress,
          ipfsHash: profile?.ipfsHash || "",
          password: "",
        }),
      },
    );
    const data = await res.json();
    console.log(">>> getBearer", data);
    if (data.bearer) {
      setBearer(data.bearer);
    } else if (data.error === "Invalid password") {
      setBearer("");
      window.localStorage.removeItem(`${communitySlug}-${accountAddress}-bearer`);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 flex-col text-center">
        <div>
          <span className="loading loading-spinner loading-lg"></span>
        </div>
        <div className="py-4">Loading profile...</div>
      </div>
    );
  }
  if (profile?.hashedPassword && !bearer) {
    return (
      <div className="p-4">
        <Authenticate config={config} accountAddress={accountAddress} onChange={handleAuthentication} />
      </div>
    );
  } else if (!bearer) {
    getBearer();
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="max-w-md mx-auto">
        <form
          className="p-2 w-full"
          onSubmit={e => {
            e.preventDefault();
            return false;
          }}
        >
          <div>
            <div className="flex flex-row my-14 justify-center">
              <EditAvatar accountAddress={accountAddress} avatarUrl={avatarUrl || ""} onChange={handleAvatarChange} />
            </div>
            <label className="form-control w-full max-w-sm">
              <div className="label">
                <span className="label-text">What&apos;s your name citizen?</span>
              </div>
              <input
                name="name"
                onChange={handleChange}
                type="text"
                defaultValue={profile?.name}
                placeholder="Type here"
                className="input input-bordered w-full max-w-sm"
              />
              <div className="info">
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
              <div className="info">
                <div className="label-text-alt">Something short, sweet and unique</div>
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
              <div className="info">
                <div className="label-text-alt">Just a few words about who you are</div>
              </div>
            </label>

            <h2 className="text-lg mt-10 mb-5">🔗 A few links about you</h2>
            <div className="flex my-2 w-full max-w-sm">
              <label className="join-item rounded-l-xl mb-1 py-3 px-2 border text-sm text-gray-400">twitter.com/</label>
              <input
                type="text"
                defaultValue={profile?.twitter}
                name="twitter"
                onChange={handleChange}
                className="input input-bordered rounded-r-xl !rounded-l-none pl-1 w-full max-w-sm"
                placeholder="twitter username"
              />
            </div>
            <div className="flex my-2 w-full max-w-sm">
              <label className="join-item rounded-l-xl mb-1 py-3 px-2 border text-sm text-gray-400">t.me/</label>
              <input
                type="text"
                defaultValue={profile?.telegram}
                name="telegram"
                onChange={handleChange}
                className="input input-bordered !rounded-l-none rounded-r-xl w-full max-w-sm"
                placeholder="telegram username"
              />
            </div>
            <div className="flex my-2 w-full max-w-sm">
              <label className="join-item rounded-l-xl mb-1 py-3 px-2 border text-sm text-gray-400">
                linkedin.com/in/
              </label>
              <input
                name="linkedin"
                type="text"
                defaultValue={profile?.linkedin}
                onChange={handleChange}
                className="input input-bordered !rounded-l-none rounded-r-xl w-full max-w-sm"
                placeholder="linkedin username"
              />
            </div>
            <div className="flex my-2 w-full max-w-sm">
              <label className="join-item rounded-l-xl mb-1 py-3 px-2 border text-sm text-gray-400">
                instagram.com/
              </label>
              <input
                name="instagram"
                type="text"
                defaultValue={profile?.instagram}
                onChange={handleChange}
                className="input input-bordered !rounded-l-none rounded-r-xl w-full max-w-sm"
                placeholder="instagram username"
              />
            </div>
            <div className="flex my-2 w-full max-w-sm">
              <label className="join-item rounded-l-xl mb-1 py-3 px-2 border text-sm text-gray-400">github.com/</label>
              <input
                name="github"
                type="text"
                defaultValue={profile?.github}
                onChange={handleChange}
                className="input input-bordered !rounded-l-none rounded-r-xl w-full max-w-sm"
                placeholder="github username"
              />
            </div>
            <div className="flex my-2 w-full max-w-sm">
              <label className="join-item rounded-l-xl mb-1 py-3 px-2 border text-sm text-gray-400">https://</label>
              <input
                name="website"
                type="text"
                defaultValue={profile?.website}
                onChange={handleChange}
                className="input input-bordered !rounded-l-none rounded-r-xl w-full max-w-sm"
                placeholder="website url"
              />
            </div>

            <label className="form-control w-full max-w-sm">
              <h2 className="text-lg mt-10 mb-5">🔐 Protect your profile</h2>
              {profile?.hashedPassword && (
                <button
                  className="btn btn-secondary !shadow-none rounded-2xl border border-white border-opacity-20 h-12 flex items-center justify-center w-full max-w-sm  bg-white bg-opacity-[0.01] active:bg-opacity-[0.2]"
                  onClick={() => toggleShowChangePassword()}
                >
                  {showChangePassword ? "Cancel change password" : "Change password"}
                </button>
              )}
              {showChangePassword && (
                <div>
                  <div className="label">
                    <span className="label-text">Set a new password</span>
                  </div>
                  <input
                    name="password"
                    onChange={handleChange}
                    type="password"
                    placeholder=""
                    className="input input-bordered w-full max-w-sm"
                    required
                  />
                  <div className="info">
                    <div className="label-text-alt">
                      Prevent anyone from scanning your NFC wallet & edit your profile
                    </div>
                  </div>
                </div>
              )}
              {!profile?.hashedPassword && (
                <div>
                  <div className="label">
                    <span className="label-text">Set a password</span>
                  </div>
                  <input
                    name="password"
                    onChange={handleChange}
                    type="password"
                    placeholder=""
                    className="input input-bordered w-full max-w-sm"
                    required
                  />
                  <div className="info">
                    <span className="label-text-alt">
                      Prevent anyone from scanning your NFC wallet & edit your profile
                    </span>
                  </div>
                </div>
              )}
            </label>
            <label className="form-control w-full max-w-sm">
              <div className="label">
                <span className="label-text">What&apos;s your crypto address or ENS?</span>
              </div>
              <input
                name="ownerAddress"
                onChange={handleChange}
                type="text"
                defaultValue={profile?.ownerAddress}
                placeholder="Type here"
                className="input input-bordered w-full max-w-sm"
              />
              <div className="info">
                <div className="label-text-alt">
                  This is where we will transfer all your crypto assets at the end of the event
                </div>
              </div>
            </label>

            <div className="mt-10 mb-5 max-w-sm w-full">
              <button
                onClick={handleSubmit}
                className={`btn btn-primary bg-white bg-opacity-20 active:bg-opacity-10 w-full max-w-xs h-12 mx-auto rounded-2xl color-[#F1F5E4] font-semibold border border-white border-opacity-20 flex justify-center items-center ${
                  saving ? "btn-disabled" : ""
                }`}
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
              <div className="flex justify-center my-2 text-sm">
                <Link href={`/${communitySlug}/${accountAddress}`}>cancel</Link>
              </div>

              {errorMsg && <div className="text-red-500 text-center">{errorMsg}</div>}
            </div>
          </div>
        </form>
      </div>
    </WagmiConfig>
  );
}
