import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { SyntheticEvent } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop"

export function handlePropertyImageError(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget
  if (img.dataset.fallback === "true") return
  img.dataset.fallback = "true"
  img.src = FALLBACK_PROPERTY_IMAGE
}
