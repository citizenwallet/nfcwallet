import { useMemo } from "react";
import { AccountState, useAccountStore } from "./state";
import { CWAccount } from "@/services/account";
import { generateWalletHash } from "@/services/account/urlAccount";
import { StorageService } from "@/services/storage";
import { generateAccountHashPath } from "@/utils/hash";
import { Config, IndexerService, QRFormat, parseQRFormat } from "@citizenwallet/sdk";
import { IndexerResponsePaginationMetadata } from "@citizenwallet/sdk/dist/src/services/indexer";
import { SigningKey, Wallet, formatUnits } from "ethers";
import { StoreApi, UseBoundStore } from "zustand";

export class AccountLogic {
  state: AccountState;
  config: Config;

  storage: StorageService;

  indexer: IndexerService;

  account?: CWAccount;
  constructor(state: AccountState, config: Config) {
    this.state = state;
    this.config = config;

    this.storage = new StorageService(config.community.alias);

    this.indexer = new IndexerService(config.indexer);
  }

  async openAccount(hash: string, createAccountCallback: (hashPath: string) => void) {
    const format = parseQRFormat(hash);

    let accountHash: string | null = hash;
    if (!accountHash || format !== QRFormat.unsupported) {
      accountHash = this.storage.getKey("hash");
      if (!accountHash) {
        this.createAccount(createAccountCallback);
        return;
      }
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
      if (!baseUrl) {
        throw new Error("Base URL not set");
      }

      const walletPassword = process.env.NEXT_PUBLIC_WEB_BURNER_PASSWORD;
      if (!walletPassword) {
        throw new Error("Wallet password not set");
      }

      this.account = await CWAccount.fromHash(baseUrl, accountHash, walletPassword, this.config);
      if (!this.account) {
        throw new Error("Invalid wallet format");
      }

      this.storage.setKey("hash", accountHash);

      this.state.setAccount(this.account.account);
      this.state.setOwner(true);

      createAccountCallback(accountHash);
    } catch (e) {
      console.error(e);
    }
  }

  async createAccount(createAccountCallback: (hashPath: string) => void) {
    try {
      const walletPassword = process.env.NEXT_PUBLIC_WEB_BURNER_PASSWORD;
      if (!walletPassword) {
        throw new Error("Wallet password not set");
      }

      this.account = await CWAccount.random(this.config);

      const hash = await generateWalletHash(this.account.account, this.account.signer, walletPassword);

      const hashPath = generateAccountHashPath(hash, this.config.community.alias);

      this.storage.setKey("hash", hashPath);

      this.state.setAccount(this.account.account);
      this.state.setOwner(true);

      createAccountCallback(hashPath);
    } catch (e) {
      console.error(e);
    }
  }

  async fetchBalance() {
    try {
      console.log(">>> fetchBalance", this.account);
      if (!this.account) {
        throw new Error("Account not set");
      }

      const balance = await this.account.getBalance();
      console.log(">>> AccountLogic / balance", balance);
      let formattedBalance = formatUnits(balance, this.config.token.decimals);
      if (this.config.token.decimals === 0) {
        formattedBalance = parseInt(formattedBalance).toString();
      }

      this.state.setBalance(formattedBalance);
    } catch (error) {}
  }

  private listenerInterval: ReturnType<typeof setInterval> | undefined;
  private listenMaxDate = new Date();
  private listenerFetchLimit = 10;

  listen(account: string) {
    try {
      if (this.listenerInterval) {
        clearInterval(this.listenerInterval);
      }

      this.listenerInterval = setInterval(async () => {
        const params = {
          fromDate: this.listenMaxDate.toISOString(),
          limit: this.listenerFetchLimit,
          offset: 0,
        };

        const { array: transfers = [] } = await this.indexer.getNewTransfers(
          this.config.token.address,
          account,
          params,
        );

        if (transfers.length > 0) {
          // new items, move the max date to the latest one
          this.listenMaxDate = new Date();
        }

        if (transfers.length === 0) {
          // nothing new to add
          return;
        }

        this.fetchBalance();

        // new items, add them to the store
        this.state.putTransfers(transfers);
      }, 1000);

      return () => {
        clearInterval(this.listenerInterval);
      };
    } catch (_) {}
    return () => {};
  }

  async fetchInitialTransfers(account: string) {
    try {
      const params = {
        maxDate: new Date("10/06/2024").toISOString(),
        limit: 10,
        offset: 0,
      };

      const { array: transfers } = await this.indexer.getTransfers(this.config.token.address, account, params);

      this.state.putTransfers(transfers);
    } catch (error) {}
  }

  private fetchMaxDate = new Date();
  private fetchLimit = 10;
  private transfersPagination?: IndexerResponsePaginationMetadata;
  private previousFetchLength = 0;
  private fetchedOffsets: number[] = [];

  /**
   * Retrieves transfers for a given address.
   *
   * @param address - The address for which to retrieve transfers.
   * @param reset - Indicates whether to reset the state before fetching transfers.
   * @returns A promise that resolves to a boolean indicating whether the transfers were successfully retrieved.
   */
  async getTransfers(account: string, reset = false): Promise<boolean> {
    try {
      if (reset) {
        this.fetchMaxDate = new Date();
        this.transfersPagination = undefined;
        this.previousFetchLength = 0;
        this.fetchedOffsets = [];
      }

      if (this.transfersPagination && this.previousFetchLength < this.fetchLimit) {
        // nothing more to fetch
        return false;
      }

      const nextOffset = this.transfersPagination ? this.transfersPagination.offset + this.fetchLimit : 0;
      if (this.fetchedOffsets.includes(nextOffset)) {
        return false;
      }
      this.fetchedOffsets.push(nextOffset);

      const params = {
        maxDate: this.fetchMaxDate.toISOString(),
        limit: this.fetchLimit,
        offset: nextOffset,
      };

      const transfers = await this.indexer.getTransfers(this.config.token.address, account, params);

      this.transfersPagination = transfers.meta;
      this.previousFetchLength = transfers.array.length;

      if (reset) {
        this.state.replaceTransfers(transfers.array);
        return true;
      }

      this.state.appendTransfers(transfers.array);
      return true;
    } catch (error) {}

    return false;
  }

  async send(to: string, amount: string, description?: string): Promise<string | null> {
    try {
      if (!this.account) {
        throw new Error("Account not set");
      }

      const tx = await this.account.send(to, amount, description);

      return tx;
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  clear() {
    this.state.clear();
  }
}

export const useAccount = (config: Config): [UseBoundStore<StoreApi<AccountState>>, AccountLogic] => {
  const sendStore = useAccountStore;

  const actions = useMemo(() => new AccountLogic(sendStore.getState(), config), [sendStore, config]);

  return [sendStore, actions];
};
