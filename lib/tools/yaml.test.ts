import { describe, expect, it } from "vitest";
import { formatYaml, jsonToYaml, yamlToJson } from "@/lib/tools/yaml";

describe("yaml helpers", () => {
  it("round-trips YAML into JSON values", () => {
    expect(JSON.parse(yamlToJson("a: 1\nb: [2, 3]"))).toEqual({ a: 1, b: [2, 3] });
  });

  it("converts JSON to YAML", () => {
    const yaml = jsonToYaml('{"a":1,"b":["x","y"]}');
    expect(yaml).toContain("a: 1");
    expect(yaml).toContain("x");
  });

  it("re-normalizes YAML documents", () => {
    const output = formatYaml("b:   2\na:   1");
    expect(output).toContain("a: 1");
    expect(output).toContain("b: 2");
  });

  it("throws on malformed YAML", () => {
    expect(() => formatYaml("a: [1, 2")).toThrow();
  });
});
