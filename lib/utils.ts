import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// generate a function that that capitalize the first letter of the string
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
