"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditAvatar from "./EditAvatar";
import { defaults } from "lodash";
import { createPublicClient, http } from "viem";
import { WagmiConfig, createConfig } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { setCache, useProfile } from "~~/hooks/citizenwallet";
import chains from "~~/lib/chains";
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
  const [badge, loading] = useProfile(config?.community.alias, accountAddress);
  const avatarUrl = badge ? getUrlFromIPFS(badge.image_medium) : "/nfcwallet-icon.jpg";
  const [saving, setSaving] = useState(false);
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
    defaults(formData, badge);
    console.log(">>> handleSubmit", formData);
    try {
      const res = await fetch(`/api/setBadge?communitySlug=${config.community.alias}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(">>> response data", data);
      if (data.error) {
        console.error("Unable to save badge", data.error);
        setErrorMsg(data.error);
        setSaving(false);
        setTimeout(() => setErrorMsg(null), 5000);
        return false;
      }
      setSaving(false);
      const badgeTokenId = data.badge?.tokenId;
      const cacheKey = `useBadge-${communitySlug}-${badgeTokenId}`;
      setCache(cacheKey, data.badge);
      router.push(`/${config.community.alias}/${accountAddress}`);
      return false;
    } catch (e) {
      console.error("Unable to save badge", e);
      setSaving(false);
      return false;
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 flex-col text-center">
        <div>
          <span className="loading loading-spinner loading-lg"></span>
        </div>
        <div className="py-4">Loading badge...</div>
      </div>
    );
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="max-w-xl mx-auto">
        <h2 className="mt-8 mx-2">Edit badge</h2>
        <form className="p-2 w-full">
          <div>
            <div className="text-center my-8">
              {badge && <h1>{badge.name}</h1>}
              {!badge && config?.community.name && <h1>{config.community.name}</h1>}
              <Address address={accountAddress} format="short" className="justify-center my-2" />
            </div>
            <div className="flex flex-row my-14 justify-center">
              <EditAvatar accountAddress={accountAddress} avatarUrl={avatarUrl || ""} onChange={handleAvatarChange} />
            </div>
            <h2 className="text-lg mb-2">👤 About you</h2>
            <label className="form-control w-full max-w-sm">
              <div className="label">
                <span className="label-text">Title</span>
              </div>
              <input
                name="title"
                onChange={handleChange}
                type="text"
                defaultValue={badge?.title}
                placeholder="Type here"
                className="input input-bordered w-full max-w-sm"
              />
            </label>
            <label className="form-control w-full max-w-sm">
              <div className="label">
                <span className="label-text">Description</span>
              </div>
              <textarea
                name="description"
                onChange={handleChange}
                className="textarea textarea-bordered h-24 w-full max-w-sm"
                defaultValue={badge?.description}
                placeholder="Bio"
              ></textarea>
            </label>
            <h2 className="text-lg mb-2">🔗 A few links about you</h2>
            <div className="join my-2 w-full max-w-sm">
              <label className="join-item rounded-r-full py-3 px-2 border-white border-2 text-sm text-gray-400">
                https://
              </label>
              <input
                name="website"
                type="text"
                defaultValue={badge?.website}
                onChange={handleChange}
                className="input input-bordered join-item pl-1 w-full max-w-sm"
                placeholder="website url"
              />
            </div>

            <div className="my-5 max-w-sm w-full">
              <button
                onClick={handleSubmit}
                className={`btn btn-primary w-full max-w-sm ${saving ? "btn-disabled" : ""}`}
              >
                {saving ? "Saving..." : "Save badge"}
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
