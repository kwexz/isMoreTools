// @vitest-environment node
import { describe, expect, it } from "vitest";
import { bufferToHex, hashAlgorithms, hashFile, hashText } from "@/lib/tools/hash";

describe("bufferToHex", () => {
  it("pads each byte to two lowercase hex digits", () => {
    expect(bufferToHex(new Uint8Array([0, 15, 255]).buffer)).toBe("000fff");
  });
});

describe("hashText", () => {
  it("matches the published SHA-256 vector for \"abc\"", async () => {
    await expect(hashText("abc", "SHA-256")).resolves.toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });

  it("matches the published SHA-512 vector for \"abc\"", async () => {
    await expect(hashText("abc", "SHA-512")).resolves.toBe(
      "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
    );
  });

  it("matches the published SHA-384 vector for \"abc\"", async () => {
    await expect(hashText("abc", "SHA-384")).resolves.toBe(
      "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7"
    );
  });

  it("matches the published MD5 vectors", async () => {
    await expect(hashText("abc", "MD5")).resolves.toBe("900150983cd24fb0d6963f7d28e17f72");
    await expect(hashText("", "MD5")).resolves.toBe("d41d8cd98f00b204e9800998ecf8427e");
  });
});

describe("hashFile", () => {
  it("hashes file contents like the equivalent text", async () => {
    const file = new File(["abc"], "a.txt");
    await expect(hashFile(file, "SHA-256")).resolves.toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });
});

describe("hashAlgorithms", () => {
  it("lists the supported algorithms", () => {
    expect(hashAlgorithms).toEqual(["SHA-256", "SHA-384", "SHA-512", "MD5"]);
  });
});
