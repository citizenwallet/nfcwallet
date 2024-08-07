import CitizenWalletCommunity from "../lib/citizenwallet";

const apiBaseUrl = process.env.NEXT_PUBLIC_WEBAPP_URL;
const communitySlug = "wallet.regenvillage.brussels";

const ipfsHash = "QmPYiAJa3a6w4ekNrQ7EVow3Q3EEhMoMxUMHwuMDtBiR3J";
const formData = {
  account: "0x9Ba0F191d31807026Cd4E9A3187805dD72Fe44aA",
  communitySlug: "wallet.regenvillage.brussels",
  name: "Xavier",
  username: "xdamman",
  description: "Short bio",
  twitter: "xdamman",
  telegram: "xdamman",
  linkedin: "xavierdamman",
  password: "0x8a6705b55aa25daf7c68a45583efdca42f741be0897c1b191169f88f80411317",
  ownerAddress: "xdamman.eth",
};

async function getBearer(communitySlug: string, accountAddress: string, profileIpfsHash?: string, password?: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/authenticate?communitySlug=${communitySlug}`, {
    method: "POST",
    body: JSON.stringify({
      account: accountAddress,
      ipfsHash: profileIpfsHash || "",
      password: password || "",
    }),
  });
  const data = await res.json();
  if (data.bearer) {
    return data.bearer;
  } else if (data.error === "Invalid password") {
    throw new Error("Invalid password");
  }
}

describe("api.setProfile", () => {
  it("should set the profile", async () => {
    formData.name = "Xavier " + Math.round(Math.random() * 10000);
    const bearer = await getBearer(formData.communitySlug, formData.account, ipfsHash, formData.password);
    formData.password = "";
    const res = await fetch(`${apiBaseUrl}/api/setProfile?communitySlug=${communitySlug}`, {
      method: "POST",
      headers: {
        authentication: `Bearer ${bearer}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    expect(json.success).toEqual(true);
    expect(json.profile.name).toBe(formData.name);
    expect(json.profile.account).toBe(formData.account);

    // Note: this will still return the previous profile because the IPFS hash is not updated yet
    const cw = new CitizenWalletCommunity(communitySlug);
    await cw.loadConfig();
    const profile = await cw.getProfile(formData.account);
    expect(profile.ipfsHash).not.toEqual(ipfsHash);
  }, 10000);

  it("should return an error if username is taken", async () => {
    const account = "0x44728104FBdEa545CB61EFe680eB8c8aABfE8D17";
    const bearer = await getBearer(formData.communitySlug, account);
    formData.password = "";
    const res = await fetch(`${apiBaseUrl}/api/setProfile?communitySlug=${communitySlug}`, {
      method: "POST",
      headers: {
        authentication: `Bearer ${bearer}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ ...formData, account }),
    });
    const json = await res.json();
    expect(json.error).toContain("Unable to save profile");
  }, 20000);
});
