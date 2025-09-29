import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { tokenList } from "@/lib/tokenList"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}