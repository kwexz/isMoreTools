export function extensionOf(name: string) {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index + 1).toLowerCase() : "";
}

export async function detectMagicType(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const header = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(" ");
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { type: "PNG image", header };
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { type: "JPEG image", header };
  if (text.startsWith("GIF87a") || text.startsWith("GIF89a")) return { type: "GIF image", header };
  if (text.startsWith("%PDF")) return { type: "PDF document", header };
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) return { type: "ZIP archive or Office document", header };
  if (text.startsWith("RIFF") && text.includes("WEBP")) return { type: "WebP image", header };
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return { type: "Possible JSON/text", header };
  if (bytes.every((byte) => byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126))) return { type: "Plain text", header };
  return { type: "Unknown", header };
}
