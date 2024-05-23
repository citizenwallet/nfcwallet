export const IPFS_BASE_URL = "https://ipfs.internal.citizenwallet.xyz";

export function getUrlFromIPFS(hash: string): string | null {
  if (!hash) return null;
  return `${IPFS_BASE_URL}/${hash.replace("ipfs://", "")}`;
}
