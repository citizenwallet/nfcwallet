import { ProfileService } from "@citizenwallet/sdk";
import { formatUnits } from "ethers";
import CardFactoryABI from "smartcontracts/build/contracts/cardFactory/CardFactory.abi.json";
import ERC20ABI from "smartcontracts/build/contracts/erc20/ERC20.abi.json";
import ProfileABI from "smartcontracts/build/contracts/profile/Profile.abi.json";
import { createPublicClient, http } from "viem";
import chains from "~~/lib/chains";
import { getHash } from "~~/utils/crypto";

const protocol = ["production", "preview"].includes(process.env.NODE_ENV) ? "https" : "http";

const CONFIG_URL = process.env.NEXT_PUBLIC_WEBAPP_URL
  ? `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/getConfig`
  : `${protocol}://config.internal.citizenwallet.xyz/v3/communities.json`;

export const IPFS_BASE_URL = "https://ipfs.internal.citizenwallet.xyz";

export default class CitizenWalletCommunity {
  communitySlug: string;
  configUrl: string;
  config: any;
  client: any;

  constructor(communitySlug: string) {
    this.communitySlug = communitySlug;
    this.configUrl = CONFIG_URL;
  }

  initClient = async () => {
    if (this.client) return this.client;
    await this.loadConfig();
    const chain = chains[this.config.node.chain_id];
    chain.rpcUrls.default.http = [this.config.node.url];
    chain.rpcUrls.default.webSocket = [this.config.node.ws_url];
    this.client = createPublicClient({
      chain,
      transport: http(),
    });
    return this.client;
  };

  loadConfig = async () => {
    if (this.config) return this.config;
    console.log(">>> fetching", this.configUrl);
    try {
      const response = await fetch(`${this.configUrl}?cacheBuster=${Math.round(new Date().getTime() / 10000)}`, {
        mode: "cors",
      });
      if (!response.ok) {
        throw new Error(`HTTP error. Unable to fetch ${this.configUrl}. Response status: ${response.status}`);
      }
      const configs = await response.json();
      const config = configs.find((config: any) => config.community.alias === this.communitySlug);
      if (!config) {
        console.error(`Community ${this.communitySlug} not found in ${this.configUrl}`);
      }
      // console.log(">>> this.config", config);
      this.config = config;
      return config;
    } catch (e) {
      console.error("Unable to fetch config", e);
      return null;
    }
  };

  getProfile = async (account: string) => {
    await this.initClient();
    const contractAddress = this.config.profile.address;
    console.log(">>> getProfile", account, contractAddress);
    try {
      const ipfsHash = await this.client.readContract({
        address: contractAddress,
        abi: ProfileABI,
        functionName: "get",
        args: [account],
      });
      const profileData = await this.fetchJSON(ipfsHash);
      return {
        ...profileData,
        ipfsHash,
      };
    } catch (e) {
      if (e.message && e.message.match(/invalid token ID/)) {
        console.error("Profile not found for", account);
      } else {
        console.error("Error while fetching profile for", account, e);
      }
      return null;
    }
  };

  getProfileFromUsername = async (username: string) => {
    await this.initClient();
    const profileService = new ProfileService(this.config);
    const profile = await profileService.getProfileFromUsername(username);
    return profile;
  };

  getCardAccountAddress = async (serialNumber: string): Promise<string | null> => {
    await this.initClient();
    const contractAddress: string | undefined = this.config.cards?.card_factory_address;
    if (!contractAddress) {
      console.error(">>> card_factory_address missing for", this.config.community.alias);
      return null;
    }
    if (!contractAddress) return null;
    if (!serialNumber) return null;

    const hash = getHash(serialNumber, contractAddress);
    const accountAddress = await this.client.readContract({
      address: contractAddress,
      abi: CardFactoryABI,
      functionName: "getCardAddress",
      args: [hash],
    });

    return accountAddress;
  };

  getBalance = async (account: string) => {
    await this.initClient();
    const contractAddress = this.config.token.address;
    const decimals = this.config.token.decimals;

    const balance = await this.client.readContract({
      address: contractAddress,
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: [account],
    });

    return parseFloat(formatUnits(balance, decimals));
  };

  getTransactions = async (account: string) => {
    await this.loadConfig();
    const apiUrl = this.config.indexer.url;
    const apiCall = `${apiUrl}/logs/transfers/${this.config.token.address}/${account}?limit=10`;
    const response = await fetch(apiCall, {
      headers: { Authorization: "Bearer x" },
    });
    const data = await response.json();
    return data.array;
  };

  fetchFromIPFS = async (ipfsHash: string) => {
    const ipfsUrl = `${IPFS_BASE_URL}/${ipfsHash.replace("ipfs://", "")}`;
    const response = await fetch(ipfsUrl);
    return await response.text();
  };

  fetchJSON = async (ipfsHash: string) => {
    const data = await this.fetchFromIPFS(ipfsHash);
    const json = JSON.parse(data);
    console.log(">>> fetched json from ipfs", ipfsHash, json);
    return json;
  };

  getImageSrc = (ipfsHash: string) => {
    const ipfsUrl = `${IPFS_BASE_URL}/${ipfsHash.replace("ipfs://", "")}`;
    return ipfsUrl;
  };
}
