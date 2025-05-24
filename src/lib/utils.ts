import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isBrowser() {
  return typeof window !== "undefined";
}

export function isMobile() {
  return isBrowser() && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}