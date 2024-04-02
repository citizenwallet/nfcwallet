export const IPFS_BASE_URL = "https://ipfs.internal.citizenwallet.xyz";

export function getUrlFromIPFS(hash: string) {
  return `${IPFS_BASE_URL}/${hash.replace("ipfs://", "")}`;
}
