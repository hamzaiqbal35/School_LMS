import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Converts 24-hour time format (HH:MM) to 12-hour AM/PM format
 * @param time24 - Time string in 24-hour format (e.g., "14:30" or "08:40")
 * @returns Time string in 12-hour format (e.g., "2:30 PM" or "8:40 AM")
 */
export function formatTime12Hour(time24: string | undefined | null): string {
    if (!time24) return 'N/A';

    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) return time24;

    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}
