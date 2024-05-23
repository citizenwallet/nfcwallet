import { ethers } from "ethers";

function serialToBigInt(serial: string): bigint {
  // Remove colons to get a clean hexadecimal string
  const hexString = serial.replace(/:/g, "");

  // Convert the hexadecimal string to bigint
  const result = BigInt(`0x${hexString}`);

  return result;
}

/**
 * Computes a keccak256 hash of the given inputs, simulating Solidity's tightly packed behavior.
 *
 * @param code - The code as a bigint.
 * @param chainId - The blockchain chain ID as a bigint.
 * @param contractAddress - The contract address as a string.
 * @returns The keccak256 hash as a string.
 */
export function getHash(serialNumber: string, chainId: bigint, contractAddress: string): string {
  // Compute the keccak256 hash of the concatenated bytes
  const code = serialToBigInt(serialNumber);
  const hash = ethers.solidityPackedKeccak256(["uint256", "uint256", "address"], [code, chainId, contractAddress]);

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
