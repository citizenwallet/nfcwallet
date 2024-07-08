import { ProfilesState } from "./state";

export const selectFilteredProfiles = (query: string) => (state: ProfilesState) => {
  if (!query) {
    return Object.values(state.profiles);
  }

  const lowerCaseInput = query.toLowerCase().trim();

  return Object.values(state.profiles).filter(
    profile =>
      profile.name.toLowerCase().trim().includes(lowerCaseInput) ||
      profile.username.toLowerCase().trim().includes(lowerCaseInput) ||
      profile.account.toLowerCase().trim().includes(lowerCaseInput),
  );
};
