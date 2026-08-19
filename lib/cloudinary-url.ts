/**
 * Client-safe Cloudinary delivery URL helpers (no SDK).
 *
 * CMS / media library URLs often already include transforms
 * (e.g. q_auto,f_auto or c_fill,w_*). Naively injecting another
 * `/upload/{transforms}/` segment duplicates them and can 404 —
 * which is why the admin preview (raw URL) works while the public
 * About team photos fail.
 */

type OptimizeOptions = {
  width?: number
  height?: number
  /** Cloudinary crop mode; defaults to fill when both width and height are set */
  crop?: string
  gravity?: string
}

/** Segment looks like a Cloudinary transformation component, not a public_id part. */
function isTransformSegment(segment: string): boolean {
  if (!segment || segment.includes(',')) return true
  if (/^t_/.test(segment)) return true // named transformation
  // Common single-parameter transforms: w_400, c_fill, q_auto, f_auto, g_face, …
  if (/^[a-z]{1,3}_/.test(segment)) return true
  return false
}

/**
 * Return path parts after `/upload/`, with any existing transformation
 * segments removed. Keeps `v123/…` version + public_id (+ extension).
 */
export function stripCloudinaryTransforms(url: string): {
  originAndPrefix: string
  publicIdPath: string
} | null {
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split('/').filter(Boolean)
    const uploadIdx = parts.indexOf('upload')
    if (uploadIdx === -1) return null

    const after = parts.slice(uploadIdx + 1)
    let i = 0
    while (i < after.length) {
      const seg = after[i]
      if (/^v\d+$/.test(seg)) break
      if (isTransformSegment(seg)) {
        i += 1
        continue
      }
      break
    }

    const publicIdParts = after.slice(i)
    if (publicIdParts.length === 0) return null

    const originAndPrefix = `${parsed.origin}/${parts.slice(0, uploadIdx + 1).join('/')}`
    return {
      originAndPrefix,
      publicIdPath: publicIdParts.join('/'),
    }
  } catch {
    return null
  }
}

/**
 * Build a fresh Cloudinary delivery URL with the requested transforms.
 * Non-Cloudinary URLs are returned unchanged.
 * Signed delivery URLs are left untouched (rewriting invalidates the signature).
 */
export function optimizeCloudinaryUrl(
  url: string | null | undefined,
  options: OptimizeOptions = {}
): string {
  if (!url) return ''
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url
  }
  // Signed URLs: /upload/s--SIGNATURE--/...
  if (url.includes('/s--')) {
    return url
  }

  const stripped = stripCloudinaryTransforms(url)
  if (!stripped) return url

  const parts: string[] = ['q_auto', 'f_auto']
  if (options.width) parts.push(`w_${options.width}`)
  if (options.height) parts.push(`h_${options.height}`)

  const crop =
    options.crop ??
    (options.width && options.height ? 'fill' : undefined)
  if (crop) parts.push(`c_${crop}`)
  if (options.gravity) parts.push(`g_${options.gravity}`)

  return `${stripped.originAndPrefix}/${parts.join(',')}/${stripped.publicIdPath}`
}
