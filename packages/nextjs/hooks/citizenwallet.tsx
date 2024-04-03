import { useEffect, useState } from "react";
import CitizenWalletCommunity from "~~/lib/citizenwallet";

export const useCommunity = (communitySlug: string) => {
  const [community, setCommunity] = useState<any>(null);
  useEffect(() => {
    const cw = new CitizenWalletCommunity(communitySlug);
    cw.loadConfig().then(community => setCommunity(community));
  }, [communitySlug]);
  return [community];
};

export const useProfile = (communitySlug: string, account: string) => {
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!communitySlug) return;
    if (!account) return;
    const configUrl = `${window.location.protocol}//${window.location.host}/api/getConfig`;
    const community = new CitizenWalletCommunity(communitySlug);
    community.configUrl = configUrl;
    if (account.substring(0, 2) === "0x") {
      community.getProfile(account).then(profile => setProfile(profile));
    } else {
      community.getProfileFromUsername(account).then(profile => setProfile(profile));
    }
  }, [communitySlug, account]);
  return [profile];
};
