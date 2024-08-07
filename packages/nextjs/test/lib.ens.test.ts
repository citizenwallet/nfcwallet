import { resolveAddress } from "@/lib/ens";

describe("ens lib", () => {
  it("resolve address", async () => {
    const address = await resolveAddress("xdamman.eth");
    expect(address).toBe("0xf11704511975cC5908f6dBd89Be922f5C86c1055");
  });
});
