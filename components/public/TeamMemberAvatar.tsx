'use client'

import { useState } from 'react'
import { optimizeCloudinaryUrl } from '@/lib/cloudinary-url'

type TeamMemberAvatarProps = {
  src: string
  alt: string
  className?: string
}

/**
 * Team photos: try a fresh Cloudinary crop, but fall back to the raw CMS URL
 * if delivery fails (duplicate/legacy transforms, signed URLs, etc.).
 * Admin always uses the raw URL, which is why CMS can look fine when public does not.
 */
export function TeamMemberAvatar({ src, alt, className }: TeamMemberAvatarProps) {
  const optimized = optimizeCloudinaryUrl(src, {
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'auto',
  })
  const [current, setCurrent] = useState(optimized || src)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (src && current !== src) setCurrent(src)
      }}
    />
  )
}
