export const generateAccountHashPath = (hash: string, alias: string) => {
  let hashPath = hash;
  if (!hash.endsWith(`?alias=${alias}`)) {
    hashPath = `${hash}?alias=${alias}`;
  }
  if (!hash.startsWith("#/wallet/")) {
    hashPath = `#/wallet/${hashPath}`;
  }

  return hashPath;
};
