import { describe, expect, it } from "vitest";
import { formatBinaryBytes, formatBytes } from "@/lib/tools/format";

describe("formatBytes", () => {
  it("formats bytes without decimals", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("uses decimal (1000) units", () => {
    expect(formatBytes(1000)).toBe("1.00 KB");
    expect(formatBytes(1500)).toBe("1.50 KB");
    expect(formatBytes(1024)).toBe("1.02 KB");
    expect(formatBytes(1_000_000)).toBe("1.00 MB");
  });

  it("honours the fraction digit option", () => {
    expect(formatBytes(1500, 0)).toBe("2 KB");
  });

  it("rejects invalid sizes", () => {
    expect(formatBytes(-1)).toBe("Invalid size");
    expect(formatBytes(Number.NaN)).toBe("Invalid size");
    expect(formatBytes(Number.POSITIVE_INFINITY)).toBe("Invalid size");
  });
});

describe("formatBinaryBytes", () => {
  it("uses binary (1024) units", () => {
    expect(formatBinaryBytes(0)).toBe("0 B");
    expect(formatBinaryBytes(1024)).toBe("1.00 KiB");
    expect(formatBinaryBytes(1024 * 1024)).toBe("1.00 MiB");
  });

  it("rejects invalid sizes", () => {
    expect(formatBinaryBytes(-5)).toBe("Invalid size");
  });
});
