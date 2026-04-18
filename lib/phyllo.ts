/**
 * Shared Phyllo API utilities.
 * All Phyllo routes import from here so credentials & base URL are centralised.
 */

export function getPhylloBaseUrl(): string {
  const url = process.env.PHYLLO_BASE_URL
  if (!url) throw new Error("Missing PHYLLO_BASE_URL env var")
  return url.replace(/\/$/, "") // strip trailing slash
}

export function getPhylloAuthHeader(): string {
  const clientId = process.env.PHYLLO_CLIENT_ID
  const secret = process.env.PHYLLO_SECRET

  if (!clientId || !secret) {
    throw new Error("Missing PHYLLO_CLIENT_ID or PHYLLO_SECRET env vars")
  }

  const encoded = Buffer.from(`${clientId}:${secret}`).toString("base64")
  return `Basic ${encoded}`
}
