import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATUS_LABELS: Record<string, string> = {
  name_check: 'Name Check',
  articles_filed: 'Articles Filed',
  ein_processing: 'EIN Processing',
  completed: 'Completed',
  on_hold: 'On Hold',
}

export const STATUS_COLORS: Record<string, string> = {
  name_check: 'bg-yellow-100 text-yellow-800',
  articles_filed: 'bg-blue-100 text-blue-800',
  ein_processing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  on_hold: 'bg-gray-100 text-gray-700',
}

export const DOC_LABELS: Record<string, string> = {
  articles: 'Articles of Organization',
  operating_agreement: 'Operating Agreement',
  ein_letter: 'EIN Confirmation Letter',
  formation_certificate: 'Formation Certificate',
  annual_report: 'Annual Report',
  other: 'Other Document',
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
