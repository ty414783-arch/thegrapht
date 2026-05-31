import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { config } from "../config.js";

const allowedImageMimeTypes = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);
const allowedAudioMimeTypes = new Map([
  ["audio/mpeg", ".mp3"],
  ["audio/mp3", ".mp3"],
  ["audio/wav", ".wav"],
  ["audio/x-wav", ".wav"],
  ["audio/ogg", ".ogg"],
  ["audio/flac", ".flac"],
  ["audio/x-flac", ".flac"],
  ["audio/aac", ".aac"],
  ["audio/mp4", ".m4a"],
  ["audio/x-m4a", ".m4a"]
]);

const hasMagicSignature = (buffer, mimeType) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    return false;
  }

  if (mimeType === "image/png") {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;
  }

  if (mimeType === "image/gif") {
    const header = buffer.subarray(0, 6).toString("ascii");
    return header === "GIF87a" || header === "GIF89a";
  }

  if (mimeType === "image/webp") {
    const riff = buffer.subarray(0, 4).toString("ascii");
    const webp = buffer.subarray(8, 12).toString("ascii");
    return riff === "RIFF" && webp === "WEBP";
  }

  return false;
};

export const ensureUploadsDirectory = async () => {
  await fs.mkdir(config.uploadsDir, { recursive: true });
  await fs.mkdir(path.join(config.uploadsDir, "images"), { recursive: true });
  await fs.mkdir(path.join(config.uploadsDir, "audios"), { recursive: true });
};

export const saveUploadedImage = async (file) => {
  if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function") {
    throw new Error("Image file is required.");
  }

  const mimeType = typeof file.type === "string" ? file.type : "";
  const fileExtension = allowedImageMimeTypes.get(mimeType);

  if (!fileExtension) {
    throw new Error("Only PNG, JPG, WEBP or GIF images are supported.");
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    throw new Error("Uploaded image is empty.");
  }

  if (file.size > config.maxUploadBytes) {
    throw new Error("Uploaded file is too large.");
  }

  const safeName = String(file.name || `image${fileExtension}`).replace(/[^a-zA-Z0-9._-]+/g, "_");
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!hasMagicSignature(buffer, mimeType)) {
    throw new Error("File content does not match declared image type.");
  }

  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const shard = sha256.slice(0, 2);
  const storedRelativePath = path.posix.join("images", year, month, day, shard, `${sha256}${fileExtension}`);
  const storedFilePath = path.join(config.uploadsDir, storedRelativePath);

  await fs.mkdir(path.dirname(storedFilePath), { recursive: true });

  try {
    await fs.access(storedFilePath);
  } catch {
    await fs.writeFile(storedFilePath, buffer);
  }

  return {
    storedRelativePath,
    mimeType,
    originalName: safeName,
    size: buffer.byteLength,
    absolutePath: storedFilePath
  };
};

export const saveUploadedAudio = async (file) => {
  if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function") {
    throw new Error("Audio file is required.");
  }

  const mimeType = typeof file.type === "string" ? file.type : "";
  const fileExtension = allowedAudioMimeTypes.get(mimeType);

  if (!fileExtension) {
    throw new Error("Only audio files are supported.");
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    throw new Error("Uploaded audio is empty.");
  }

  if (file.size > config.maxUploadBytes) {
    throw new Error("Uploaded file is too large.");
  }

  const safeName = String(file.name || `audio${fileExtension}`).replace(/[^a-zA-Z0-9._-]+/g, "_");
  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const shard = sha256.slice(0, 2);
  const storedRelativePath = path.posix.join("audios", year, month, day, shard, `${sha256}${fileExtension}`);
  const storedFilePath = path.join(config.uploadsDir, storedRelativePath);

  await fs.mkdir(path.dirname(storedFilePath), { recursive: true });

  try {
    await fs.access(storedFilePath);
  } catch {
    await fs.writeFile(storedFilePath, buffer);
  }

  return {
    storedRelativePath,
    mimeType,
    originalName: safeName,
    size: buffer.byteLength,
    absolutePath: storedFilePath
  };
};

export const resolveUploadPath = (storedFilePath) => {
  const normalizedRoot = path.resolve(config.uploadsDir);
  const relativePath = String(storedFilePath || "").replace(/\\/g, "/").replace(/^\/+/, "");

  if (!relativePath) {
    return null;
  }

  const resolvedPath = path.resolve(config.uploadsDir, relativePath);

  if (resolvedPath === normalizedRoot || !resolvedPath.startsWith(`${normalizedRoot}${path.sep}`)) {
    return null;
  }

  return resolvedPath;
};
