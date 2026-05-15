import { parse, stringify } from "yaml";

export function formatYaml(input: string) {
  return stringify(parse(input));
}

export function yamlToJson(input: string, spaces = 2) {
  return JSON.stringify(parse(input), null, spaces);
}

export function jsonToYaml(input: string) {
  return stringify(JSON.parse(input));
}
