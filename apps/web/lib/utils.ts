export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'M';
}

export function formatDate(value: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return 'Not set';
  const date = value.includes('T') ? new Date(value) : new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('en-IN', options ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export function relativeTime(value: string) {
  const then = new Date(value).getTime();
  const reference = new Date('2026-11-05T09:30:00.000Z').getTime();
  const minutes = Math.max(0, Math.round((reference - then) / 60000));
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

export function titleCase(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function isOverdue(value: string | null) {
  return !!value && value < '2026-11-05';
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(body?.error?.message ?? 'The request could not be completed. Please try again.') as Error & {
      code?: string;
      status?: number;
    };
    error.code = body?.error?.code;
    error.status = response.status;
    throw error;
  }
  return body as T;
}
