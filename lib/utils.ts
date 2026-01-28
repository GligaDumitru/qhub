import { techMap } from "@/constants/techMap";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// generate a function that that capitalize the first letter of the string
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getDeviconClassName = (techName: string) => {
  const normalizedTechName = techName.replace(/[ .]/g, "").toLowerCase();

  return techMap[normalizedTechName] ? `${techMap[normalizedTechName]} colored` : "devicon-devicon-plain";
};

export const getTimeStamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diff / (1000 * 60));
  const diffInHours = Math.floor(diff / (1000 * 60 * 60));
  const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  return diffInDays > 0
    ? `${diffInDays}d`
    : diffInHours > 0
      ? `${diffInHours}h`
      : diffInMinutes > 0
        ? `${diffInMinutes}m`
        : `just now`;
};
