import { useEffect, useState } from "react";
import CitizenWalletCommunity from "~~/lib/citizenwallet";

export const setCache = function (cacheKey: string, data: any) {
  const dataString = JSON.stringify({
    timestamp: new Date().getTime(),
    data,
  });
  window.localStorage.setItem(cacheKey, dataString);
};

export const useCommunity = (communitySlug: string) => {
  const [community, setCommunity] = useState<any>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!communitySlug) return;

    const cacheKey = `useCommunity-${communitySlug}`;

    const cachedItem = window.localStorage.getItem(cacheKey);
    if (cachedItem) {
      const cacheEntry = JSON.parse(cachedItem);
      setCommunity(cacheEntry.data);
      // return [cacheEntry.data]; // we always fetch the new updated profile info for next load.
    }

    function setData(data: any) {
      setCommunity(data);
      setCache(cacheKey, data);
    }

    const configUrl = `${window.location.protocol}//${window.location.host}/api/getConfig`;
    const community = new CitizenWalletCommunity(communitySlug);
    community.configUrl = configUrl;
    community.loadConfig().then(community => setData(community));
  }, [communitySlug]);
  return [community];
};

export const useProfile = (communitySlug: string, account: string) => {
  const [profile, setProfile] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!communitySlug) return;
    if (!account) return;

    const cacheKey = `useProfile-${communitySlug}-${account}`;
    const cachedItem = window.localStorage.getItem(cacheKey);
    if (cachedItem) {
      console.log("cache hit", cacheKey);
      const cacheEntry = JSON.parse(cachedItem);
      setProfile(cacheEntry.data);
      setLoading(false);

      // if the cache is less than 30s old, return it.
      if (new Date().getTime() < parseInt(cacheEntry.timestamp) + 1000 * 30) {
        // 30s
        return;
      }
      // return [cacheEntry.data]; // we always fetch the new updated profile info for next load.
    }

    function setProfileCache(profile: any) {
      setProfile(profile);
      setCache(cacheKey, profile);
    }

    const configUrl = `${window.location.protocol}//${window.location.host}/api/getConfig`;
    const community = new CitizenWalletCommunity(communitySlug);
    community.configUrl = configUrl;
    if (account.substring(0, 2) === "0x") {
      community.getProfile(account).then(profile => {
        setProfileCache(profile);
        setLoading(false);
      });
    } else {
      community.getProfileFromUsername(account).then(profile => {
        setProfileCache(profile);
        setLoading(false);
      });
    }
  }, [communitySlug, account]);
  return [profile, loading];
};

export const useCardAccountAddress = (communitySlug: string, serialNumber: string) => {
  console.log(">>> useCardAccountAddress", communitySlug, serialNumber);
  const [cardAccountAddress, setCardAccountAddress] = useState<any>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!communitySlug) return;
    if (!serialNumber) return;
    const configUrl = `${window.location.protocol}//${window.location.host}/api/getConfig`;
    const community = new CitizenWalletCommunity(communitySlug);
    community.configUrl = configUrl;
    console.log(">>> configUrl", configUrl);
    community.getCardAccountAddress(serialNumber).then(cardAccountAddress => {
      console.log(">>> cardAccountAddress", cardAccountAddress);
      setCardAccountAddress(cardAccountAddress);
    });
  }, [communitySlug, serialNumber]);
  return [cardAccountAddress];
};

export const getCardAccountAddress = async (communitySlug: string, serialNumber: string): Promise<string | null> => {
  if (!communitySlug) return null;
  if (typeof window === "undefined") return null;
  const configUrl = `${window.location.protocol}//${window.location.host}/api/getConfig`;
  const community = new CitizenWalletCommunity(communitySlug);
  community.configUrl = configUrl;
  const cardAccountAddress = await community.getCardAccountAddress(serialNumber);
  return cardAccountAddress;
};
