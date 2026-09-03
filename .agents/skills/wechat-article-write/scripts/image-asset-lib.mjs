import { existsSync, readFileSync, statSync } from "node:fs";

export function usableImageFile(path) {
  try {
    if (!existsSync(path) || !statSync(path).isFile() || statSync(path).size === 0) return false;
    const bytes = readFileSync(path);
    const ext = path.slice(path.lastIndexOf(".")).toLowerCase();
    if (ext === ".png") return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    if (ext === ".jpg" || ext === ".jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (ext === ".gif") return bytes.length >= 6 && /GIF8[79]a/.test(bytes.subarray(0, 6).toString("ascii"));
    if (ext === ".webp") return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  } catch { return false; }
  return false;
}

export function imageMime(path) {
  const bytes = readFileSync(path);
  const ext = path.slice(path.lastIndexOf(".")).toLowerCase();
  if (ext === ".png" && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if ((ext === ".jpg" || ext === ".jpeg") && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (ext === ".gif" && /GIF8[79]a/.test(bytes.subarray(0, 6).toString("ascii"))) return "image/gif";
  if (ext === ".webp" && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

export function imageDimensions(path) {
  const bytes = readFileSync(path);
  const ext = path.slice(path.lastIndexOf(".")).toLowerCase();
  if (ext === ".png" && bytes.length >= 24) return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (ext === ".gif" && bytes.length >= 10) return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
  if (ext === ".webp" && bytes.length >= 30 && bytes.subarray(12, 16).toString("ascii") === "VP8X") {
    return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1];
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9) continue;
      if (offset + 2 > bytes.length) break;
      const length = bytes.readUInt16BE(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
        return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
      }
      offset += length;
    }
  }
  return null;
}

export function assertCoverPixelAspect(path) {
  const dimensions = imageDimensions(path);
  if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0) throw new Error(`cover dimensions cannot be read for ${path}`);
  const actual = dimensions.width / dimensions.height;
  if (Math.abs(actual - 2.35) > 0.03) throw new Error(`cover pixel aspect ratio must be 2.35:1 ±0.03; found ${dimensions.width}x${dimensions.height} (${actual.toFixed(4)}:1)`);
  return dimensions;
}
