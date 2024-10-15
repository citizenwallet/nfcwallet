import CardManagerABI from "../contracts/CardManagerABI.json";
import { ProfileService } from "@citizenwallet/sdk";
import { BundlerService } from "@citizenwallet/sdk/dist/src/services/bundler";
import { ethers } from "ethers";
import accountFactoryContractAbi from "smartcontracts/build/contracts/accfactory/AccountFactory.abi.json";
import CardFactoryABI from "smartcontracts/build/contracts/cardFactory/CardFactory.abi.json";
import ERC20ABI from "smartcontracts/build/contracts/erc20/ERC20.abi.json";
import ProfileABI from "smartcontracts/build/contracts/profile/Profile.abi.json";
import { createPublicClient, http } from "viem";
import chains from "~~/lib/chains";
import { getHash, getIdHash, getSerialHash } from "~~/utils/crypto";

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
      this.config = config;
      return config;
    } catch (e) {
      console.error("Unable to fetch config", e);
      return null;
    }
  };

  getProfile = async (accountAddress: string) => {
    await this.initClient();
    const contractAddress = this.config.profile.address;
    try {
      const ipfsHash = await this.client.readContract({
        address: contractAddress,
        abi: ProfileABI,
        functionName: "get",
        args: [accountAddress],
      });
      const profileData = await this.fetchJSON(ipfsHash);
      return {
        ...profileData,
        ipfsHash,
      };
    } catch (e: any) {
      if (e.message && e.message.match(/invalid token ID/)) {
        console.error("Profile not found for", accountAddress);
      } else {
        console.error("Error while fetching profile for", accountAddress, e);
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
    try {
      await this.initClient();
      const contractAddress: string | undefined = this.config.cards?.card_factory_address;
      const safeContractAddress: string | undefined = this.config.safe_cards?.card_manager_address;
      if (!contractAddress && !safeContractAddress) {
        console.error(">>> card_factory_address missing for", this.config.community.alias);
        return null;
      }
      if (!contractAddress && !safeContractAddress) return null;
      if (!serialNumber) return null;

      if (safeContractAddress) {
        // Safe cards
        const hashedId = getIdHash("test");
        const hashedSerial = getSerialHash(serialNumber);
        const accountAddress = await this.client.readContract({
          address: safeContractAddress,
          abi: CardManagerABI,
          functionName: "getCardAddress",
          args: [hashedId, hashedSerial],
        });
        return accountAddress;
      }

      // Standard cards
      const hash = getHash(serialNumber, this.config.cards.card_factory_address || "");
      const accountAddress = await this.client.readContract({
        address: contractAddress,
        abi: CardFactoryABI,
        functionName: "getCardAddress",
        args: [hash],
      });

      return accountAddress;
    } catch (error) {
      console.error("Error while fetching card account address", error);
    }

    return null;
  };

  getBalance = async (accountAddress: string) => {
    await this.initClient();
    const contractAddress = this.config.token.address;
    const decimals = this.config.token.decimals;

    const balance = await this.client.readContract({
      address: contractAddress,
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: [accountAddress],
    });

    return parseFloat(ethers.formatUnits(balance, decimals));
  };

  getTransactions = async (accountAddress: string) => {
    await this.loadConfig();
    const apiUrl = this.config.indexer.url;
    const apiCall = `${apiUrl}/logs/transfers/${this.config.token.address}/${accountAddress}?limit=10`;
    const response = await fetch(apiCall, {
      headers: { Authorization: "Bearer x" },
    });
    const data = await response.json();
    return data.array;
  };

  mint = async (accountAddress: string, amount: number, description: string) => {
    await this.loadConfig();
    const provider = new ethers.JsonRpcProvider(this.config.node.url);
    const serverWallet = new ethers.Wallet(process.env.PRIVATE_KEY || "");
    const signer = serverWallet.connect(provider);
    const bundler = new BundlerService(this.config);
    const accountFactoryContract = new ethers.Contract(
      this.config.erc4337.account_factory_address,
      accountFactoryContractAbi,
      provider,
    );
    const sender = await accountFactoryContract.getFunction("getAddress")(signer.address, 0);

    try {
      console.log(
        ">>> Minting token",
        typeof process.env.PRIVATE_KEY,
        serverWallet.address,
        amount,
        this.config.token.symbol,
        "for",
        accountAddress,
        "from",
        signer.address,
      );
      const data = await bundler.mintERC20Token(
        // @ts-ignore I don't know how to fix this (why is the exact same code working fine for the /topup route?)
        signer,
        this.config.token.address,
        sender,
        accountAddress,
        `${amount}`,
        description || "minting",
      );

      console.log(">>> Minted token", data);
      return data;
    } catch (e) {
      console.error("Error:", e);
      return { error: "Error minting token", status: 500 };
    }
  };

  fetchFromIPFS = async (ipfsHash: string) => {
    const ipfsUrl = `${IPFS_BASE_URL}/${ipfsHash.replace("ipfs://", "")}`;
    const response = await fetch(ipfsUrl);
    return await response.text();
  };

  fetchJSON = async (ipfsHash: string) => {
    const data = await this.fetchFromIPFS(ipfsHash);
    const json = JSON.parse(data);
    return json;
  };

  getImageSrc = (ipfsHash: string) => {
    const ipfsUrl = `${IPFS_BASE_URL}/${ipfsHash.replace("ipfs://", "")}`;
    return ipfsUrl;
  };
}
