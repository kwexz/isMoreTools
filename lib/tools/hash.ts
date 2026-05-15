export type HashAlgorithm = "MD5" | "SHA-256" | "SHA-384" | "SHA-512";

export const hashAlgorithms: HashAlgorithm[] = ["SHA-256", "SHA-384", "SHA-512", "MD5"];

export function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashText(text: string, algorithm: HashAlgorithm) {
  const data = new TextEncoder().encode(text);
  if (algorithm === "MD5") return md5(data);
  return bufferToHex(await crypto.subtle.digest(algorithm, data));
}

export async function hashFile(file: File, algorithm: HashAlgorithm) {
  const buffer = await file.arrayBuffer();
  if (algorithm === "MD5") return md5(new Uint8Array(buffer));
  return bufferToHex(await crypto.subtle.digest(algorithm, buffer));
}

function md5(input: Uint8Array) {
  const rotateLeft = (value: number, shift: number) => (value << shift) | (value >>> (32 - shift));
  const add = (a: number, b: number) => (a + b) >>> 0;
  const words: number[] = [];
  const bitLength = input.length * 8;
  const paddedLength = (((input.length + 8) >>> 6) + 1) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(input);
  padded[input.length] = 0x80;
  for (let i = 0; i < 8; i += 1) padded[paddedLength - 8 + i] = (bitLength / 2 ** (8 * i)) & 0xff;
  for (let i = 0; i < padded.length; i += 4) {
    words.push(padded[i] | (padded[i + 1] << 8) | (padded[i + 2] << 16) | (padded[i + 3] << 24));
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  const s = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  const k = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32));

  for (let chunk = 0; chunk < words.length; chunk += 16) {
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;
    for (let i = 0; i < 64; i += 1) {
      let f: number;
      let g: number;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      const temp = d;
      d = c;
      c = b;
      const shift = s[Math.floor(i / 16) * 4 + (i % 4)];
      b = add(b, rotateLeft(add(add(a, f), add(k[i], words[chunk + g])), shift));
      a = temp;
    }
    a0 = add(a0, a);
    b0 = add(b0, b);
    c0 = add(c0, c);
    d0 = add(d0, d);
  }

  return [a0, b0, c0, d0]
    .flatMap((word) => [word & 0xff, (word >>> 8) & 0xff, (word >>> 16) & 0xff, (word >>> 24) & 0xff])
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
