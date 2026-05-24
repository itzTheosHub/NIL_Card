import crypto from "crypto"

/**
 * App-layer encryption for OAuth tokens stored in Supabase.
 * Uses AES-256-GCM with a server-side secret for defense in depth.
 *
 * TOKEN_ENCRYPTION_KEY must be a 64-char hex string (32 bytes).
 * Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)")
  }
  return Buffer.from(key, "hex")
}

/**
 * Encrypt a plaintext string.
 * Returns a base64-encoded string containing: IV + authTag + ciphertext
 */
export function encryptToken(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, "utf8")
  encrypted = Buffer.concat([encrypted, cipher.final()])

  const authTag = cipher.getAuthTag()

  // Pack: IV (16) + authTag (16) + ciphertext (variable)
  const packed = Buffer.concat([iv, authTag, encrypted])
  return packed.toString("base64")
}

/**
 * Decrypt a base64-encoded encrypted string.
 * Returns the original plaintext.
 */
export function decryptToken(encryptedBase64: string): string {
  const key = getKey()
  const packed = Buffer.from(encryptedBase64, "base64")

  const iv = packed.subarray(0, IV_LENGTH)
  const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const ciphertext = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext)
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString("utf8")
}
