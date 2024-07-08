import { getAccount, getDecryptKdfParams, getPassword } from "./ethers";
import { HDNodeWallet, Wallet, pbkdf2, scrypt } from "ethers";

export const parsePrivateKeyFromHash = async (
  baseUrl: string,
  hash: string,
  walletPassword: string,
): Promise<[string, HDNodeWallet | Wallet] | [undefined, undefined]> => {
  const encodedURL = new URL(`${baseUrl}/${hash.replace("#/", "")}`);
  const encoded = encodedURL.pathname.replace("/wallet/", "");

  try {
    if (!encoded.startsWith("v3-")) {
      throw new Error("Invalid wallet format");
    }

    const decoded = Buffer.from(encoded.replace("v3-", ""), "base64").toString("utf-8");

    const [account, encryptedPrivateKey] = decoded.split("|");
    if (!account || !encryptedPrivateKey) {
      throw new Error("Invalid wallet format");
    }

    const jsonPrivateKey = JSON.parse(encryptedPrivateKey);
    if (!!jsonPrivateKey.Crypto) {
      jsonPrivateKey.crypto = jsonPrivateKey.Crypto;
      delete jsonPrivateKey.Crypto;
    }

    const password = getPassword(walletPassword);

    const params = getDecryptKdfParams(jsonPrivateKey);
    let key: string;
    if (params.name === "pbkdf2") {
      const { salt, count, dkLen, algorithm } = params;
      key = pbkdf2(password, salt, count, dkLen, algorithm);
    } else {
      const { salt, N, r, p, dkLen } = params;
      key = await scrypt(password, salt, N, r, p, dkLen, () => {});
    }

    const keyStoreAccount = getAccount(jsonPrivateKey, key);

    const wallet = new Wallet(keyStoreAccount.privateKey);

    return [account, wallet];
  } catch (e) {
    console.error(e);
  }

  return [undefined, undefined];
};

export const parseLegacyWalletFromHash = async (
  baseUrl: string,
  hash: string,
  walletPassword: string,
): Promise<HDNodeWallet | Wallet | undefined> => {
  const encodedURL = new URL(`${baseUrl}/${hash.replace("#/", "")}`);
  const encoded = encodedURL.pathname.replace("/wallet/", "");

  try {
    if (!encoded.startsWith("v2-")) {
      throw new Error("Invalid wallet format");
    }

    const encryptedPrivateKey = atob(encoded.replace("v2-", ""));

    const wallet = await Wallet.fromEncryptedJson(encryptedPrivateKey, walletPassword);

    return wallet;
  } catch (e) {}

  return;
};

export const generateWalletHash = async (
  account: string,
  wallet: HDNodeWallet | Wallet,
  walletPassword: string,
): Promise<string> => {
  const encryptedPrivateKey = await wallet.encrypt(walletPassword);

  const encoded = btoa(`${account}|${encryptedPrivateKey}`);

  return `v3-${encoded}`;
};
