import { Config } from "@citizenwallet/sdk";
import { JsonRpcProvider, encodeBytes32String, ethers } from "ethers";
import accountFactoryContractAbi from "smartcontracts/build/contracts/accfactory/AccountFactory.abi.json";
import accountContractAbi from "smartcontracts/build/contracts/account/Account.abi.json";
import tokenContractAbi from "smartcontracts/build/contracts/erc20/ERC20.abi.json";
import profileContractAbi from "smartcontracts/build/contracts/profile/Profile.abi";
import tokenEntryPointContractAbi from "smartcontracts/build/contracts/tokenEntryPoint/TokenEntryPoint.abi.json";

const accountFactoryInterface = new ethers.Interface(accountFactoryContractAbi);
const accountInterface = new ethers.Interface(accountContractAbi);
const erc20Token = new ethers.Interface(tokenContractAbi);
const profileInterface = new ethers.Interface(profileContractAbi);

interface UserOpExtraData {
  description: string;
}

export interface UserOp {
  sender: string;
  nonce: bigint;
  initCode: Uint8Array;
  callData: Uint8Array;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: Uint8Array;
  signature: Uint8Array;
}

interface JsonUserOp {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

const executeCallData = (contractAddress: string, calldata: string) =>
  ethers.getBytes(accountInterface.encodeFunctionData("execute", [contractAddress, BigInt(0), calldata]));

const transferCallData = (tokenAddress: string, receiver: string, amount: bigint) =>
  ethers.getBytes(
    accountInterface.encodeFunctionData("execute", [
      tokenAddress,
      BigInt(0),
      erc20Token.encodeFunctionData("transfer", [receiver, amount]),
    ]),
  );

const setProfileCallData = (
  profileContractAddress: string,
  profileAccountAddress: string,
  username: string,
  ipfsHash: string,
) => {
  console.log(">>> setProfileCallData", profileContractAddress, profileAccountAddress, username, ipfsHash);
  return ethers.getBytes(
    accountInterface.encodeFunctionData("execute", [
      profileContractAddress,
      0n,
      profileInterface.encodeFunctionData("set", [profileAccountAddress, encodeBytes32String(username), ipfsHash]),
    ]),
  );
};

const getEmptyUserOp = (sender: string): UserOp => ({
  sender,
  nonce: BigInt(0),
  initCode: ethers.getBytes("0x"),
  callData: ethers.getBytes("0x"),
  callGasLimit: BigInt(0),
  verificationGasLimit: BigInt(0),
  preVerificationGas: BigInt(0),
  maxFeePerGas: BigInt(0),
  maxPriorityFeePerGas: BigInt(0),
  paymasterAndData: ethers.getBytes("0x"),
  signature: ethers.getBytes("0x"),
});

const userOpToJson = (userop: UserOp): JsonUserOp => {
  const newUserop: JsonUserOp = {
    sender: userop.sender,
    nonce: ethers.toBeHex(userop.nonce.toString()).replace("0x0", "0x"),
    initCode: ethers.hexlify(userop.initCode),
    callData: ethers.hexlify(userop.callData),
    callGasLimit: ethers.toBeHex(userop.callGasLimit.toString()).replace("0x0", "0x"),
    verificationGasLimit: ethers.toBeHex(userop.verificationGasLimit.toString()).replace("0x0", "0x"),
    preVerificationGas: ethers.toBeHex(userop.preVerificationGas.toString()).replace("0x0", "0x"),
    maxFeePerGas: ethers.toBeHex(userop.maxFeePerGas.toString()).replace("0x0", "0x"),
    maxPriorityFeePerGas: ethers.toBeHex(userop.maxPriorityFeePerGas.toString()).replace("0x0", "0x"),
    paymasterAndData: ethers.hexlify(userop.paymasterAndData),
    signature: ethers.hexlify(userop.signature),
  };

  return newUserop;
};

const userOpFromJson = (userop: JsonUserOp): UserOp => {
  const newUserop: UserOp = {
    sender: userop.sender,
    nonce: BigInt(userop.nonce),
    initCode: ethers.getBytes(userop.initCode),
    callData: ethers.getBytes(userop.callData),
    callGasLimit: BigInt(userop.callGasLimit),
    verificationGasLimit: BigInt(userop.verificationGasLimit),
    preVerificationGas: BigInt(userop.preVerificationGas),
    maxFeePerGas: BigInt(userop.maxFeePerGas),
    maxPriorityFeePerGas: BigInt(userop.maxPriorityFeePerGas),
    paymasterAndData: ethers.getBytes(userop.paymasterAndData),
    signature: ethers.getBytes(userop.signature),
  };

  return newUserop;
};

export class BundlerService {
  private provider: JsonRpcProvider;
  private bundlerProvider: JsonRpcProvider;

  constructor(private config: Config) {
    this.config = config;

    const rpcUrl = `${this.config.erc4337.rpc_url}/${this.config.erc4337.paymaster_address}`;

    this.provider = new ethers.JsonRpcProvider(this.config.node.url);
    this.bundlerProvider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async senderAccountExists(sender: string) {
    const url = `${this.config.indexer.url}/accounts/${sender}/exists`;

    const resp = await fetch(url);
    return resp.status === 200;
  }

  private generateUserOp(
    signerAddress: string,
    sender: string,
    senderAccountExists = false,
    accountFactoryAddress: string,
    callData: Uint8Array,
  ) {
    const userop = getEmptyUserOp(sender);

    // initCode
    if (!senderAccountExists) {
      const accountCreationCode = accountFactoryInterface.encodeFunctionData("createAccount", [
        signerAddress,
        BigInt(0),
      ]);

      userop.initCode = ethers.getBytes(ethers.concat([accountFactoryAddress, accountCreationCode]));
    }

    // callData
    userop.callData = callData;

    return userop;
  }

  private async prepareUserOp(owner: string, sender: string, callData: Uint8Array): Promise<UserOp> {
    if (this.config.erc4337 === undefined || this.config.token === undefined) {
      throw new Error("Invalid config object");
    }

    const accountFactoryAddress = this.config.erc4337.account_factory_address;

    // check that the sender's account exists
    const exists = await this.senderAccountExists(sender);

    // generate a userop
    const userop = this.generateUserOp(owner, sender, exists, accountFactoryAddress, callData);

    return userop;
  }

  private async paymasterSignUserOp(userop: UserOp) {
    const method = "pm_ooSponsorUserOperation";

    const params = [
      userOpToJson(userop),
      this.config.erc4337.entrypoint_address,
      { type: this.config.erc4337.paymaster_type },
      1,
    ];

    const response = await this.bundlerProvider.send(method, params);

    if (!response?.length) {
      throw new Error("Invalid response");
    }

    return userOpFromJson(response[0]);
  }

  private async signUserOp(signer: ethers.Signer, userop: UserOp): Promise<Uint8Array> {
    const tokenEntryPointContract = new ethers.Contract(
      this.config.erc4337.entrypoint_address,
      tokenEntryPointContractAbi,
      this.provider,
    );

    const userOpHash = ethers.getBytes(await tokenEntryPointContract.getUserOpHash(userop));

    const signature = ethers.getBytes(await signer.signMessage(userOpHash));

    return signature;
  }

  private async submitUserOp(userop: UserOp, extraData?: UserOpExtraData) {
    const method = "eth_sendUserOperation";

    const params: any[] = [userOpToJson(userop), this.config.erc4337.entrypoint_address];

    if (extraData) {
      params.push(extraData);
    }

    const response = await this.bundlerProvider.send(method, params);

    if (!response?.length) {
      throw new Error("Invalid response");
    }

    return userop;
  }

  async submit(
    signer: ethers.Signer,
    sender: string,
    contractAddress: string,
    calldata: string,
    description?: string,
  ): Promise<UserOp> {
    const owner = await signer.getAddress();

    const executeCalldata = executeCallData(contractAddress, calldata);

    let userop = await this.prepareUserOp(owner, sender, executeCalldata);

    // get the paymaster to sign the userop
    userop = await this.paymasterSignUserOp(userop);

    // sign the userop
    const signature = await this.signUserOp(signer, userop);

    userop.signature = signature;

    // submit the user op
    await this.submitUserOp(userop, description !== undefined ? { description } : undefined);

    return userop;
  }

  async sendERC20Token(
    signer: ethers.Signer,
    tokenAddress: string,
    from: string,
    to: string,
    amount: string,
    description?: string,
  ): Promise<UserOp> {
    const formattedAmount = ethers.parseUnits(amount, this.config.token.decimals);

    const calldata = transferCallData(tokenAddress, to, formattedAmount);

    const owner = await signer.getAddress();

    let userop = await this.prepareUserOp(owner, from, calldata);

    // get the paymaster to sign the userop
    userop = await this.paymasterSignUserOp(userop);

    // sign the userop
    const signature = await this.signUserOp(signer, userop);

    userop.signature = signature;

    // submit the user op
    await this.submitUserOp(userop, description !== undefined ? { description } : undefined);

    return userop;
  }
  async setProfile(
    signer: ethers.Signer,
    signerAccountAddress: string,
    profileAccountAddress: string,
    username: string,
    ipfsHash: string,
  ): Promise<UserOp> {
    const calldata = setProfileCallData(this.config.profile.address, profileAccountAddress, username, ipfsHash);

    const owner = await signer.getAddress();

    let userop = await this.prepareUserOp(owner, signerAccountAddress, calldata);

    // get the paymaster to sign the userop
    userop = await this.paymasterSignUserOp(userop);

    // sign the userop
    const signature = await this.signUserOp(signer, userop);

    userop.signature = signature;

    // submit the user op
    await this.submitUserOp(userop);

    return userop;
  }
}
