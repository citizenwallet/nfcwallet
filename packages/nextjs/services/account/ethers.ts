/**
 * ethers.ts
 *
 * Keystore JSON Wallets generated using web3dart create issues when trying to decrypt.
 * See here: https://github.com/ethers-io/ethers.js/pull/4772
 *
 * If the PR gets merged, this file can be removed.
 *
 * This file is a copy of some functions from ethers.js that were not exported.
 * The only modification is the removal of the extra 00 from the private key.
 */

import {
  CodedEthersError,
  ErrorCode,
  KeystoreAccount,
  assert,
  assertArgument,
  computeAddress,
  concat,
  getAddress,
  getBytes,
  getBytesCopy,
  hexlify,
  keccak256,
  makeError,
  toUtf8Bytes,
} from "ethers";
import { AES } from "./aes";

export function getAccount(data: any, _key: string): KeystoreAccount {
  const key = getBytes(_key);
  const ciphertext = spelunk<Uint8Array>(data, "crypto.ciphertext:data!");

  const computedMAC = hexlify(
    keccak256(concat([key.slice(16, 32), ciphertext]))
  ).substring(2);
  assertArgument(
    computedMAC === spelunk<string>(data, "crypto.mac:string!").toLowerCase(),
    "incorrect password",
    "password",
    "[ REDACTED ]"
  );

  const privateKey = decrypt(data, key.slice(0, 16), ciphertext);

  // our custom modification
  const correctedPrivateKey = privateKey.startsWith("0x00")
    ? privateKey.replace("0x00", "0x")
    : privateKey;
  // end of our custom modification

  const address = computeAddress(correctedPrivateKey);
  if (data.address) {
    let check = data.address.toLowerCase();
    if (!check.startsWith("0x")) {
      check = "0x" + check;
    }

    assertArgument(
      getAddress(check) === address,
      "keystore address/privateKey mismatch",
      "address",
      data.address
    );
  }

  const account: KeystoreAccount = { address, privateKey: correctedPrivateKey };

  return account;
}

export function spelunk<T>(object: any, _path: string): T {
  const match = _path.match(/^([a-z0-9$_.-]*)(:([a-z]+))?(!)?$/i);
  assertArgument(match != null, "invalid path", "path", _path);

  const path = match[1];
  const type = match[3];
  const reqd = match[4] === "!";

  let cur = object;
  for (const comp of path.toLowerCase().split(".")) {
    // Search for a child object with a case-insensitive matching key
    if (Array.isArray(cur)) {
      if (!comp.match(/^[0-9]+$/)) {
        break;
      }
      cur = cur[parseInt(comp)];
    } else if (typeof cur === "object") {
      let found: any = null;
      for (const key in cur) {
        if (key.toLowerCase() === comp) {
          found = cur[key];
          break;
        }
      }
      cur = found;
    } else {
      cur = null;
    }

    if (cur == null) {
      break;
    }
  }

  assertArgument(!reqd || cur != null, "missing required value", "path", path);

  if (type && cur != null) {
    if (type === "int") {
      if (typeof cur === "string" && cur.match(/^-?[0-9]+$/)) {
        return <T>(<unknown>parseInt(cur));
      } else if (Number.isSafeInteger(cur)) {
        return cur;
      }
    }

    if (type === "number") {
      if (typeof cur === "string" && cur.match(/^-?[0-9.]*$/)) {
        return <T>(<unknown>parseFloat(cur));
      }
    }

    if (type === "data") {
      if (typeof cur === "string") {
        return <T>(<unknown>looseArrayify(cur));
      }
    }

    if (type === "array" && Array.isArray(cur)) {
      return <T>(<unknown>cur);
    }
    if (type === typeof cur) {
      return cur;
    }

    assertArgument(false, `wrong type found for ${type} `, "path", path);
  }

  return cur;
}

export function looseArrayify(hexString: string): Uint8Array {
  if (typeof hexString === "string" && !hexString.startsWith("0x")) {
    hexString = "0x" + hexString;
  }
  return getBytesCopy(hexString);
}

function decrypt(data: any, key: Uint8Array, ciphertext: Uint8Array): string {
  const cipher = spelunk<string>(data, "crypto.cipher:string");
  if (cipher === "aes-128-ctr") {
    const iv = spelunk<Uint8Array>(data, "crypto.cipherparams.iv:data!");
    const aesCtr = new CTR(key, iv);
    return hexlify(aesCtr.decrypt(ciphertext));
  }

  assert(false, "unsupported cipher", "UNSUPPORTED_OPERATION", {
    operation: "decrypt",
  });
}

export abstract class ModeOfOperation {
  readonly aes!: AES;
  readonly name!: string;

  constructor(name: string, key: Uint8Array, cls?: any) {
    if (cls && !(this instanceof cls)) {
      throw new Error(`${name} must be instantiated with "new"`);
    }

    Object.defineProperties(this, {
      aes: { enumerable: true, value: new AES(key) },
      name: { enumerable: true, value: name },
    });
  }

  abstract encrypt(plaintext: Uint8Array): Uint8Array;
  abstract decrypt(ciphertext: Uint8Array): Uint8Array;
}

export class CTR extends ModeOfOperation {
  // Remaining bytes for the one-time pad
  #remaining: Uint8Array;
  #remainingIndex: number;

  // The current counter
  #counter: Uint8Array;

  constructor(key: Uint8Array, initialValue?: number | Uint8Array) {
    super("CTR", key, CTR);

    this.#counter = new Uint8Array(16);
    this.#counter.fill(0);

    this.#remaining = this.#counter; // This will be discarded immediately
    this.#remainingIndex = 16;

    if (initialValue == null) {
      initialValue = 1;
    }

    if (typeof initialValue === "number") {
      this.setCounterValue(initialValue);
    } else {
      this.setCounterBytes(initialValue);
    }
  }

  get counter(): Uint8Array {
    return new Uint8Array(this.#counter);
  }

  setCounterValue(value: number): void {
    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value > Number.MAX_SAFE_INTEGER
    ) {
      throw new TypeError("invalid counter initial integer value");
    }

    for (let index = 15; index >= 0; --index) {
      this.#counter[index] = value % 256;
      value = Math.floor(value / 256);
    }
  }

  setCounterBytes(value: Uint8Array): void {
    if (value.length !== 16) {
      throw new TypeError("invalid counter initial Uint8Array value length");
    }

    this.#counter.set(value);
  }

  increment() {
    for (let i = 15; i >= 0; i--) {
      if (this.#counter[i] === 255) {
        this.#counter[i] = 0;
      } else {
        this.#counter[i]++;
        break;
      }
    }
  }

  encrypt(plaintext: Uint8Array): Uint8Array {
    const crypttext = new Uint8Array(plaintext);

    for (let i = 0; i < crypttext.length; i++) {
      if (this.#remainingIndex === 16) {
        this.#remaining = this.aes.encrypt(this.#counter);
        this.#remainingIndex = 0;
        this.increment();
      }
      crypttext[i] ^= this.#remaining[this.#remainingIndex++];
    }

    return crypttext;
  }

  decrypt(ciphertext: Uint8Array): Uint8Array {
    return this.encrypt(ciphertext);
  }
}

export function getPassword(password: string | Uint8Array): Uint8Array {
  if (typeof password === "string") {
    return toUtf8Bytes(password, "NFKC");
  }
  return getBytesCopy(password);
}

type ScryptParams = {
  name: "scrypt";
  salt: Uint8Array;
  N: number;
  r: number;
  p: number;
  dkLen: number;
};

type KdfParams =
  | ScryptParams
  | {
      name: "pbkdf2";
      salt: Uint8Array;
      count: number;
      dkLen: number;
      algorithm: "sha256" | "sha512";
    };

export function getDecryptKdfParams<T>(data: any): KdfParams {
  const kdf = spelunk(data, "crypto.kdf:string");
  if (kdf && typeof kdf === "string") {
    if (kdf.toLowerCase() === "scrypt") {
      const salt = spelunk<Uint8Array>(data, "crypto.kdfparams.salt:data!");
      const N = spelunk<number>(data, "crypto.kdfparams.n:int!");
      const r = spelunk<number>(data, "crypto.kdfparams.r:int!");
      const p = spelunk<number>(data, "crypto.kdfparams.p:int!");

      // Make sure N is a power of 2
      assertArgument(N > 0 && (N & (N - 1)) === 0, "invalid kdf.N", "kdf.N", N);
      assertArgument(r > 0 && p > 0, "invalid kdf", "kdf", kdf);

      const dkLen = spelunk<number>(data, "crypto.kdfparams.dklen:int!");
      assertArgument(dkLen === 32, "invalid kdf.dklen", "kdf.dflen", dkLen);

      return { name: "scrypt", salt, N, r, p, dkLen: 64 };
    } else if (kdf.toLowerCase() === "pbkdf2") {
      const salt = spelunk<Uint8Array>(data, "crypto.kdfparams.salt:data!");

      const prf = spelunk<string>(data, "crypto.kdfparams.prf:string!");
      const algorithm = prf.split("-").pop();
      assertArgument(
        algorithm === "sha256" || algorithm === "sha512",
        "invalid kdf.pdf",
        "kdf.pdf",
        prf
      );

      const count = spelunk<number>(data, "crypto.kdfparams.c:int!");

      const dkLen = spelunk<number>(data, "crypto.kdfparams.dklen:int!");
      assertArgument(dkLen === 32, "invalid kdf.dklen", "kdf.dklen", dkLen);

      return { name: "pbkdf2", salt, count, dkLen, algorithm };
    }
  }

  assertArgument(false, "unsupported key-derivation function", "kdf", kdf);
}
