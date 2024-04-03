import { ethers } from "ethers";
import ERC20ABI from "smartcontracts/build/contracts/erc20/ERC20.abi.json";
import ProfileABI from "smartcontracts/build/contracts/profile/Profile.abi.json";
import { createPublicClient, http } from "viem";
import chains from "~~/lib/chains";

const protocol = ["production", "preview"].includes(process.env.NODE_ENV) ? "https" : "http";

const CONFIG_URL =
  process.env.NODE_ENV === "test"
    ? `${protocol}://config.internal.citizenwallet.xyz/v3/communities.json`
    : `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/getConfig`;

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
    const response = await fetch(this.configUrl, {
      mode: "cors",
    });
    if (!response.ok) {
      throw new Error(`HTTP error. Unable to fetch ${this.configUrl}. Response status: ${response.status}`);
    }
    const configs = await response.json();
    const config = configs.find((config: any) => config.community.alias === this.communitySlug);
    this.config = config;
    return config;
  };

  getProfile = async (account: string) => {
    await this.initClient();
    const contractAddress = this.config.profile.address;

    const ipfsHash = await this.client.readContract({
      address: contractAddress,
      abi: ProfileABI,
      functionName: "get",
      args: [account],
    });

    return this.fetchJSON(ipfsHash);
  };

  getProfileFromUsername = async (username: string) => {
    await this.initClient();
    const contractAddress = this.config.profile.address;

    const username32 = ethers.encodeBytes32String(username);
    try {
      const ipfsHash = await this.client.readContract({
        address: contractAddress,
        abi: ProfileABI,
        functionName: "getFromUsername",
        args: [username32],
      });
      return this.fetchJSON(ipfsHash);
    } catch (e) {
      // console.error(JSON.stringify(e, null, 2));
      console.error(e.shortMessage);
      return null;
    }
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

    return parseFloat(ethers.formatUnits(balance, decimals));
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
    return JSON.parse(data);
  };

  getImageSrc = (ipfsHash: string) => {
    const ipfsUrl = `${IPFS_BASE_URL}/${ipfsHash.replace("ipfs://", "")}`;
    return ipfsUrl;
  };
}
