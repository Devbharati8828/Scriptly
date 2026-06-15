import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDaysUntil(dateString: string): number {
  const today = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'low-supply': 'bg-amber-100 text-amber-700 border-amber-200',
    'pending-refill': 'bg-orange-100 text-orange-700 border-orange-200',
    'discontinued': 'bg-gray-100 text-gray-500 border-gray-200',
    'paused': 'bg-slate-100 text-slate-600 border-slate-200',
    'approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'under-review': 'bg-blue-100 text-blue-700 border-blue-200',
    'submitted': 'bg-sky-100 text-sky-700 border-sky-200',
    'denied': 'bg-red-100 text-red-700 border-red-200',
    'pending-submission': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'appealed': 'bg-purple-100 text-purple-700 border-purple-200',
    'expired': 'bg-gray-100 text-gray-500 border-gray-200',
    'placed': 'bg-blue-100 text-blue-700 border-blue-200',
    'processing': 'bg-amber-100 text-amber-700 border-amber-200',
    'out-for-delivery': 'bg-purple-100 text-purple-700 border-purple-200',
    'ready-for-pickup': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
}
