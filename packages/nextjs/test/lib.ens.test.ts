import { getTextRecord, resolveAddress } from "@/lib/ens";

describe("ens lib", () => {
  it("resolve address", async () => {
    const address = await resolveAddress("commonshub.eth");
    expect(address).toBe("0x1438b634A4feBEE5F15588B65Fd4049C0526c55d");
  });
  it("resolve address on gnosis", async () => {
    const address = await resolveAddress("commonshub.eth", "gno");
    expect(address).toBe("0x646C32CF6843540CEF790F764952a959FB9c49f5");
  });
  it("resolve address on gnosis, with fallback to eth", async () => {
    const address = await resolveAddress("xdamman.eth", "gno");
    expect(address).toBe("0xf11704511975cC5908f6dBd89Be922f5C86c1055");
  });
  it("get text record", async () => {
    const address = await getTextRecord("commonshub.eth", "com.twitter");
    expect(address).toBe("commonshub_bxl");
  });
});
