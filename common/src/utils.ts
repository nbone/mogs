import { v4 as uuidv4 } from 'uuid'

/**
 * Return an 6-char UID using the alphabet [0-9a-z].
 * Based on UUID v4, but only about 31 bits, because that's still way more than we need.
 */
export function shortid () {
  // UUIDs have a '8-4-4-4-12' character layout (32 hex chars in five dash-separated groups).
  // We're generating a random base-36 id, in the range [0, 36**6), so we need at least 32 bits, or 8 characters of the v4 UUID.
  // The last 12 chars are arguably the "most random", based on the RFC4122 spec, so we'll draw from those.
  const idv4 = uuidv4()
  const base16fragment = idv4.slice(-8)
  const base36id = Number.parseInt(base16fragment, 16).toString(36)
  // There's a small chance that we'll get more or fewer than 6 chars, so pad and trim if necessary
  return base36id.padStart(6, '0').slice(-6)
}
