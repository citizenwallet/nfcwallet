import { claimPoap, getPoapData, getPoaps, hasPoap, stopRenewAccessToken } from "../lib/poap";

// Mock data for the test
const mockEventId = 175275;
const mockSecret = 599254;
const mockHash = "yrnj21";
const collectorAddress = "0x1057caa45bdb449483c81877360358e7d185f304";

afterAll(() => {
  stopRenewAccessToken();
});

describe("getPoaps", () => {
  it("fetches POAPs successfully", async () => {
    const data = await getPoaps(mockEventId, mockSecret);
    expect(data.length).toEqual(10);
    expect(data[0].qr_hash.length).toEqual(6);
    expect(data[1].claimed).toBeBoolean();
  });
  it("tests if a user has a POAP", async () => {
    const data = await hasPoap("0xf11704511975cC5908f6dBd89Be922f5C86c1055", mockEventId);
    expect(data.statusCode).toEqual(404);
    const data2 = await hasPoap(collectorAddress, mockEventId);
    expect(data2.event.id).toEqual(mockEventId);
    expect(data2.owner.toUpperCase()).toEqual(collectorAddress.toUpperCase());
  });
  it("should return error if already claimed", async () => {
    const poapData = await getPoapData(mockHash);
    const data = await claimPoap(collectorAddress, mockEventId, poapData.secret);
    console.log(data);
  });
});
