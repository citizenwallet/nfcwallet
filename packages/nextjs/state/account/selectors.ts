import { AccountState } from "./state";

export const selectOrderedTransfers = (state: AccountState) => {
  return [...state.transfers].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};
