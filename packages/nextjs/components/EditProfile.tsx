"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Authenticate from "./Authenticate";
import EditAvatar from "./EditAvatar";
import { defaults } from "lodash";
import { createPublicClient, http } from "viem";
import { WagmiConfig, createConfig } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
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
  });

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
  }, [bearer]);

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

  function handleAuthentication(bearer: string) {
    setBearer(bearer);
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (showChangePassword && !formData.password) {
      setErrorMsg("Please enter a new password");
      setTimeout(() => setErrorMsg(null), 3000);
      return false;
    }
    if ((!profile || !profile.hashedPassword) && !formData.password) {
      setErrorMsg("Please enter a password");
      setTimeout(() => setErrorMsg(null), 3000);
      return false;
    }
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
      setSaving(false);
      return false;
    }
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
      <div className="max-w-xl mx-auto">
        <h2 className="mt-8 mx-2">Edit profile</h2>
        <form className="p-2 w-full">
          <div>
            <div className="text-center my-8">
              {profile && <h1>{profile.name}</h1>}
              {!profile && config?.community.name && <h1>{config.community.name}</h1>}
              <Address address={accountAddress} format="short" className="justify-center my-2" />
            </div>
            <div className="flex flex-row my-14 justify-center">
              <EditAvatar accountAddress={accountAddress} avatarUrl={avatarUrl || ""} onChange={handleAvatarChange} />
            </div>
            <h2 className="text-lg mb-2">👤 About you</h2>
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
                twitter.com/
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
                t.me/
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
                linkedin.com/in/
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
                instagram.com/
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
                github.com/
              </label>
              <input
                name="github"
                type="text"
                defaultValue={profile?.github}
                onChange={handleChange}
                className="input input-bordered join-item pl-1 w-full max-w-sm"
                placeholder="github username"
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

            <label className="form-control w-full max-w-sm">
              <h2 className="text-lg mb-2">🔐 Protect your profile</h2>
              {profile?.hashedPassword && (
                <button className="btn btn-secondary w-full max-w-sm" onClick={() => setShowChangePassword(true)}>
                  Change password
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
                  <div className="label">
                    <span className="label-text-alt">
                      To prevent anyone from scanning your NFC wallet and change your profile
                    </span>
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
                  <div className="label">
                    <span className="label-text-alt">
                      To prevent anyone from scanning your NFC wallet and change your profile
                    </span>
                  </div>
                </div>
              )}
            </label>

            <div className="my-5 max-w-sm w-full">
              <button
                onClick={handleSubmit}
                className={`btn btn-primary w-full max-w-sm ${saving ? "btn-disabled" : ""}`}
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
