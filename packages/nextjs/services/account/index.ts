import { parseLegacyWalletFromHash, parsePrivateKeyFromHash } from "./urlAccount";
import { Config, ERC20ContractService, IndexerService } from "@citizenwallet/sdk";
import { BundlerService } from "@citizenwallet/sdk/dist/src/services/bundler";
import { AccountFactoryService } from "@citizenwallet/sdk/dist/src/services/contracts/AccountFactory";
import { BaseWallet, HDNodeWallet, JsonRpcProvider, Signer, Wallet, toUtf8Bytes } from "ethers";

export class CWAccount {
  provider: JsonRpcProvider;
  bundler: BundlerService;
  indexer: IndexerService;

  config: Config;
  account: string;
  signer: Wallet | HDNodeWallet;

  erc20: ERC20ContractService;
  constructor(config: Config, account: string, signer: Wallet | HDNodeWallet) {
    this.provider = new JsonRpcProvider(config.node.url);
    this.bundler = new BundlerService(config);
    this.indexer = new IndexerService(config.indexer);

    this.config = config;
    this.account = account;
    this.signer = signer;

    this.erc20 = new ERC20ContractService(config.token.address, config.node.ws_url, this.provider);
  }

  static async random(config: Config) {
    const wallet = Wallet.createRandom();

    const provider = new JsonRpcProvider(config.node.url);

    const connectedWallet = wallet.connect(provider);

    const afService = new AccountFactoryService(config.erc4337.account_factory_address, connectedWallet);

    const account = await afService.getAddress();

    return new CWAccount(config, account, wallet);
  }

  static async fromHash(baseUrl: string, hash: string, walletPassword: string, config: Config) {
    const [_, encoded] = hash.split("#/wallet/");

    console.log(encoded);

    let account: string | undefined;
    let signer: Wallet | HDNodeWallet | undefined;

    try {
      if (!encoded.startsWith("v3-")) {
        throw new Error("Invalid wallet format");
      }

      [account, signer] = await parsePrivateKeyFromHash(baseUrl, hash, walletPassword);

      console.log("account", account);
      console.log("signer", signer);

      if (!account || !signer) {
        throw new Error("Invalid wallet format");
      }
    } catch (error) {
      console.error(error);
      if (!encoded.startsWith("v2-")) {
        throw new Error("Invalid wallet format");
      }

      signer = await parseLegacyWalletFromHash(baseUrl, hash, walletPassword);
      if (!signer) {
        throw new Error("Invalid wallet format");
      }

      const afService = new AccountFactoryService(config.erc4337.account_factory_address, signer);

      account = await afService.getAddress();
    }

    if (!account || !signer) {
      throw new Error("Invalid wallet format");
    }

    return new CWAccount(config, account, signer);
  }

  async getBalance() {
    return this.erc20.balanceOf(this.account);
  }

  async send(to: string, amount: string, description?: string) {
    const hash = await this.bundler.sendERC20Token(
      this.signer,
      this.config.token.address,
      this.account,
      to,
      amount,
      description,
    );

    return hash;
  }

  async waitForTransactionSuccess(txHash: string) {
    const receipt = await this.provider.waitForTransaction(txHash);
    if (receipt && receipt.status === 1) {
      return true;
    }

    return false;
  }
}
