export function formatJson(input: string, spaces: number) {
  return JSON.stringify(JSON.parse(input), null, spaces);
}

export function minifyJson(input: string) {
  return JSON.stringify(JSON.parse(input));
}

export function getJsonError(input: string) {
  try {
    JSON.parse(input);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid JSON.";
  }
}
