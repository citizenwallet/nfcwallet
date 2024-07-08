import { Transfer } from "@citizenwallet/sdk";
import { create } from "zustand";

export interface AccountState {
  account: string;
  owner: boolean;
  balance: string;
  transfers: Transfer[];
  sending: boolean;
  sendError: string | null;
  setAccount: (account: string) => void;
  setOwner: (owner: boolean) => void;
  setBalance: (balance: string) => void;
  replaceTransfers: (transfers: Transfer[]) => void;
  appendTransfers: (transfers: Transfer[]) => void;
  putTransfers: (transfers: Transfer[]) => void;
  sendRequest: () => void;
  sendSuccess: () => void;
  sendFailure: (error: string) => void;
  clear: () => void;
}

const initialState = () => ({
  account: "",
  owner: false,
  balance: "0.00",
  transfers: [],
  sending: false,
  sendError: null,
});

export const useAccountStore = create<AccountState>(set => ({
  ...initialState(),
  setAccount: account => set(state => ({ account })),
  setOwner: owner => set(state => ({ owner })),
  setBalance: balance => set(state => ({ balance })),
  replaceTransfers: transfers => set(state => ({ transfers })),
  appendTransfers: transfers =>
    set(state => {
      const existingTransfers = [...state.transfers];

      transfers.forEach(transfer => {
        const existingTransfer = existingTransfers.find(t => t.hash === transfer.hash);

        if (!existingTransfer) {
          existingTransfers.unshift(transfer);
        }
      });

      return { transfers: existingTransfers };
    }),
  putTransfers: transfers =>
    set(state => {
      const existingTransfers = [...state.transfers];

      transfers.forEach(transfer => {
        const index = existingTransfers.findIndex(t => t.hash === transfer.hash);

        if (index === -1) {
          existingTransfers.push(transfer);
        } else {
          existingTransfers[index] = transfer;
        }
      });

      return { transfers: existingTransfers };
    }),
  sendRequest: () => set(state => ({ sending: true })),
  sendSuccess: () => set(state => ({ sending: false })),
  sendFailure: error => set(state => ({ sending: false, sendError: error })),
  clear: () => set(initialState()),
}));
