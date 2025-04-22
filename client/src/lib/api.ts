import { format, formatDistanceToNow } from "date-fns";

/**
 * Format a date in a user-friendly format
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return "No date";
  const dateObj = new Date(date);
  return format(dateObj, "MMM d, yyyy");
}

/**
 * Format a time in a user-friendly format
 * @param date The date/time to format
 * @returns Formatted time string
 */
export function formatTime(date: string | Date | null): string {
  if (!date) return "";
  const dateObj = new Date(date);
  return format(dateObj, "h:mm a");
}

/**
 * Format a date as a relative time
 * @param date The date to format
 * @returns Relative time string (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date | null): string {
  if (!date) return "";
  const dateObj = new Date(date);
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format a currency value
 * @param value The value to format
 * @param currency The currency code
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Format file size in a human-readable way
 * @param bytes The file size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
  else return (bytes / 1073741824).toFixed(1) + " GB";
}

/**
 * Get the color for a task status
 * @param status The task status
 * @returns CSS color class
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-success-500";
    case "in-progress":
      return "bg-primary-500";
    case "to-do":
      return "bg-neutral-400";
    case "on-hold":
      return "bg-warning-500";
    case "cancelled":
      return "bg-danger-500";
    default:
      return "bg-neutral-300";
  }
}

/**
 * Get the border color for a task based on its status
 * @param status The task status
 * @returns CSS border color class
 */
export function getTaskBorderColor(status: string): string {
  switch (status) {
    case "completed":
      return "border-success-500";
    case "in-progress":
      return "border-primary-500";
    case "to-do":
      return "border-neutral-400";
    case "on-hold":
      return "border-warning-500";
    case "cancelled":
      return "border-danger-500";
    default:
      return "border-neutral-300";
  }
}

/**
 * Get the color for a task priority
 * @param priority The task priority
 * @returns CSS color class
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-danger-500";
    case "medium":
      return "bg-warning-500";
    case "low":
      return "bg-success-500";
    default:
      return "bg-neutral-400";
  }
}

/**
 * Calculate percentage of completion
 * @param completed Number of completed items
 * @param total Total number of items
 * @returns Percentage as a number
 */
export function calculatePercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Format duration in seconds to MM:SS format
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
