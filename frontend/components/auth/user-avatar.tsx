"use client"

import { useMemo } from "react"
import { toSvg } from "jdenticon"

interface UserAvatarProps {
  value: string
  alt: string
  size?: number
}

export function UserAvatar({ value, alt, size = 32 }: Readonly<UserAvatarProps>) {
  const identicon = useMemo(
    () =>
      toSvg(value || alt || "user", size, {
        backColor: "#0000",
        padding: 0.12,
        hues: [210, 245, 280, 20],
        saturation: {
          color: 0.48,
          grayscale: 0.2,
        },
        lightness: {
          color: [0.44, 0.7],
          grayscale: [0.42, 0.68],
        },
      }),
    [alt, size, value]
  )

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, display: "block" }}
      dangerouslySetInnerHTML={{ __html: identicon }}
    />
  )
}
