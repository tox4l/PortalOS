const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  archive: ["application/zip", "text/csv"],
};

const ALL_ALLOWED = Object.values(ALLOWED_MIME_TYPES).flat();

const MAGIC_BYTES: Record<string, number[]> = {
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/gif": [0x47, 0x49, 0x46, 0x38],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
  "application/zip": [0x50, 0x4b, 0x03, 0x04],
};

const FORBIDDEN_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1f]/g;

export function validateMimeType(mimeType: string): { valid: boolean; reason?: string } {
  if (!mimeType || !ALL_ALLOWED.includes(mimeType)) {
    return {
      valid: false,
      reason: `File type "${mimeType || "unknown"}" is not allowed. Accepted types: images (PNG, JPEG, GIF, WebP, SVG), documents (PDF, Word, Excel), archives (ZIP, CSV).`,
    };
  }
  return { valid: true };
}

export function validateFileName(name: string): { valid: boolean; sanitized: string; reason?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, sanitized: "", reason: "File name is empty." };
  }

  if (name.startsWith(".")) {
    return { valid: false, sanitized: "", reason: "Hidden files are not allowed." };
  }

  const sanitized = name.replace(FORBIDDEN_FILENAME_CHARS, "_").slice(0, 200);

  if (sanitized.length === 0) {
    return { valid: false, sanitized: "", reason: "File name contains only forbidden characters." };
  }

  return { valid: true, sanitized };
}

export function validateFileSize(size: number, maxBytes: number): { valid: boolean; reason?: string } {
  if (size <= 0) {
    return { valid: false, reason: "File is empty." };
  }

  if (size > maxBytes) {
    const maxMB = (maxBytes / (1024 * 1024)).toFixed(0);
    const sizeMB = (size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      reason: `File size (${sizeMB} MB) exceeds the ${maxMB} MB limit.`,
    };
  }

  return { valid: true };
}

export function validateFileMagicBytes(
  buffer: Buffer,
  claimedMimeType: string
): { valid: boolean; reason?: string } {
  const expected = MAGIC_BYTES[claimedMimeType];
  if (!expected) {
    return { valid: true };
  }

  if (buffer.length < expected.length) {
    return {
      valid: false,
      reason: `File is too small to be a valid ${claimedMimeType}.`,
    };
  }

  for (let i = 0; i < expected.length; i++) {
    if (buffer[i] !== expected[i]) {
      return {
        valid: false,
        reason: `File content does not match claimed type ${claimedMimeType}.`,
      };
    }
  }

  return { valid: true };
}

export function validateFileUpload(
  fileName: string,
  mimeType: string,
  size: number,
  maxBytes: number
): { valid: boolean; sanitized?: string; reason?: string } {
  const nameCheck = validateFileName(fileName);
  if (!nameCheck.valid) return nameCheck;

  const typeCheck = validateMimeType(mimeType);
  if (!typeCheck.valid) return { valid: false, reason: typeCheck.reason };

  const sizeCheck = validateFileSize(size, maxBytes);
  if (!sizeCheck.valid) return { valid: false, reason: sizeCheck.reason };

  return { valid: true, sanitized: nameCheck.sanitized };
}

/*
 * Supabase Storage RLS Policies for the "deliverables" bucket:
 *
 * 1. Service role has full access (already default).
 * 2. Public access: DENY all reads and writes.
 * 3. Agency authenticated users: INSERT and SELECT on their agency's path prefix.
 *    Path pattern: {agencySlug}/{projectId}/{deliverableId}-{fileName}
 * 4. Client users: SELECT only via signed URLs (no direct bucket access).
 *
 * Apply these policies in the Supabase Dashboard:
 *   Storage → Buckets → deliverables → Policies
 */
