import { describe, expect, it } from "vitest";
import { formatJson, getJsonError, minifyJson } from "@/lib/tools/json";

describe("formatJson", () => {
  it("pretty-prints with the requested indentation", () => {
    expect(formatJson('{"a":1,"b":[2,3]}', 2)).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
  });

  it("throws on invalid JSON", () => {
    expect(() => formatJson("{", 2)).toThrow();
  });
});

describe("minifyJson", () => {
  it("removes insignificant whitespace", () => {
    expect(minifyJson('{ "a" : 1,  "b" : 2 }')).toBe('{"a":1,"b":2}');
  });
});

describe("getJsonError", () => {
  it("returns null for valid JSON", () => {
    expect(getJsonError('{"a":1}')).toBeNull();
  });

  it("returns a message for invalid JSON", () => {
    const error = getJsonError("{");
    expect(typeof error).toBe("string");
    expect(error).toBeTruthy();
  });
});
