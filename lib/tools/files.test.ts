// @vitest-environment node
import { describe, expect, it } from "vitest";
import { detectMagicType, extensionOf } from "@/lib/tools/files";

const file = (bytes: number[] | string, name: string) =>
  new File([typeof bytes === "string" ? bytes : new Uint8Array(bytes)], name);

describe("extensionOf", () => {
  it("returns the lowercase extension", () => {
    expect(extensionOf("photo.PNG")).toBe("png");
    expect(extensionOf("archive.tar.gz")).toBe("gz");
  });

  it("returns an empty string when there is no extension", () => {
    expect(extensionOf("README")).toBe("");
    expect(extensionOf("trailing.")).toBe("");
  });
});

describe("detectMagicType", () => {
  it("detects PNG and exposes its magic-byte header", async () => {
    const result = await detectMagicType(file([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "a.png"));
    expect(result.type).toBe("PNG image");
    expect(result.header.startsWith("89 50 4e 47")).toBe(true);
  });

  it("detects JPEG, GIF, PDF, and ZIP signatures", async () => {
    await expect(detectMagicType(file([0xff, 0xd8, 0xff, 0xe0], "a.jpg"))).resolves.toMatchObject({
      type: "JPEG image"
    });
    await expect(detectMagicType(file("GIF89a...", "a.gif"))).resolves.toMatchObject({ type: "GIF image" });
    await expect(detectMagicType(file("%PDF-1.7", "a.pdf"))).resolves.toMatchObject({ type: "PDF document" });
    await expect(detectMagicType(file([0x50, 0x4b, 0x03, 0x04], "a.zip"))).resolves.toMatchObject({
      type: "ZIP archive or Office document"
    });
  });

  it("recognizes JSON-ish text and plain text", async () => {
    await expect(detectMagicType(file('{"a":1}', "a.json"))).resolves.toMatchObject({
      type: "Possible JSON/text"
    });
    await expect(detectMagicType(file("hello world", "a.txt"))).resolves.toMatchObject({ type: "Plain text" });
  });

  it("falls back to Unknown for binary noise", async () => {
    await expect(detectMagicType(file([0x00, 0xff, 0xfe, 0x01], "a.bin"))).resolves.toMatchObject({
      type: "Unknown"
    });
  });
});
