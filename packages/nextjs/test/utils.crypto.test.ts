import { getHash } from "../utils/crypto";

describe("utils.crypto", () => {
  it("generate a hash", () => {
    const hash = getHash("02:7a:b9:86:04:e0:00", 456n, "0x1234567890123456789012345678901234567890");
    expect(hash.length).toEqual(66);
    expect(hash).toEqual("0x2f2df4f817a8c926bba298e03f3842079627dd0f4a05e6341d1bb953b865dc3c");
  });
});
