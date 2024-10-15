import CitizenWalletCommunity from "@/lib/citizenwallet";
import { ethers } from "ethers";

const PRIVATE_KEY = "0x0123456789012345678901234567890123456789012345678901234567890123";
const ADDRESS = "0xb591B969e96945fDd9a4EEbcF051ee53a9eC7fAd";

describe("citizenwallet lib", () => {
  it("mint a token", async () => {
    const wallet = new ethers.Wallet(PRIVATE_KEY);
    const cw = new CitizenWalletCommunity("beer.citizenwallet.xyz");
    const tx = await cw.mint(ADDRESS, 0.001, "test minting beer token");
    console.log(">>> lib.citizenwallet.test: Minted token", tx);
  }, 15000);
});
