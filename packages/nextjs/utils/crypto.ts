import { ethers } from "ethers";

function serialToBigInt(serial: string): bigint {
  // Remove colons to get a clean hexadecimal string
  const hexString = serial.replace(/:/g, "");

  // Convert the hexadecimal string to bigint
  const result = BigInt(`0x${hexString}`);

  return result;
}

export function stringToKeccak256(input: string): string {
  // Convert the string to bytes
  const bytes = ethers.toUtf8Bytes(input);

  // Compute the keccak256 hash of the bytes
  const hash = ethers.keccak256(bytes);

  return hash;
}

/**
 * Computes a keccak256 hash of the given inputs, simulating Solidity's tightly packed behavior.
 *
 * @param code - The code as a bigint.
 * @param contractAddress - The contract address as a string.
 * @returns The keccak256 hash as a string.
 */
export function getHash(serialNumber: string, contractAddress: string): string {
  // Compute the keccak256 hash of the concatenated bytes
  const code = serialToBigInt(serialNumber);
  const hash = ethers.solidityPackedKeccak256(["uint256", "address"], [code, contractAddress]);

  return hash;
}

export function getIdHash(id: string): string {
  const idHash = stringToKeccak256(id);

  return idHash;
}

/**
 * Computes a keccak256 hash of the given inputs, simulating Solidity's tightly packed behavior.
 *
 * @param code - The code as a bigint.
 * @param contractAddress - The contract address as a string.
 * @returns The keccak256 hash as a string.
 */
export function getSerialHash(serialNumber: string): string {
  const parsedSerialNumber = serialToBigInt(serialNumber);
  const hashedSerialNumber = ethers.keccak256(ethers.toBeArray(parsedSerialNumber));

  return hashedSerialNumber;
}

export const convertBigIntToUint8Array = (value: bigint): Uint8Array => {
  // Convert BigInt to hexadecimal string
  let hexString = value.toString(16);

  // Ensure even length by padding with '0' if necessary
  if (hexString.length % 2 !== 0) {
    hexString = "0" + hexString;
  }

  // Convert hex string to Uint8Array
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }

  return bytes;
};

/**
 * Computes a keccak256 hash of the given inputs, simulating Solidity's tightly packed behavior.
 *
 * @param password - the unencrypted password.
 * @param chainId - The blockchain chain ID as a bigint.
 * @param contractAddress - The contract address as a string.
 * @returns The keccak256 hash as a string.
 */
export function getPasswordHash(password: string, chainId: bigint, contractAddress: string): string {
  // Compute the keccak256 hash of the concatenated bytes
  const hash = ethers.solidityPackedKeccak256(["string", "uint256", "address"], [password, chainId, contractAddress]);

  return hash;
}

/**
 * Computes a keccak256 hash of the given inputs, simulating Solidity's tightly packed behavior.
 *
 * @param password - the unencrypted password.
 * @param chainId - The blockchain chain ID as a bigint.
 * @param contractAddress - The contract address as a string.
 * @returns The keccak256 hash as a string.
 */
export function getServerPasswordHash(password: string, secret: string): string {
  // Compute the keccak256 hash of the concatenated bytes
  const hash = ethers.solidityPackedKeccak256(["string", "string"], [password, secret]);
  return hash;
}
