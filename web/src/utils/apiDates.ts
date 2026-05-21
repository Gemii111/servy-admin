import { format, isValid } from 'date-fns';
import { ar } from 'date-fns/locale';

/** يدعم ISO وصيغة الباكند مثل `2026-05-20 14:22:01` */
export function parseApiDate(value?: string | null): Date | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  const normalized =
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(trimmed) && !trimmed.includes('T')
      ? trimmed.replace(' ', 'T')
      : trimmed;
  const d = new Date(normalized);
  return isValid(d) ? d : null;
}

export function formatApiDateTime(
  value?: string | null,
  pattern = 'dd MMM yyyy HH:mm'
): string {
  const d = parseApiDate(value);
  if (!d) return value?.trim() || '—';
  return format(d, pattern, { locale: ar });
}

export function formatApiDate(value?: string | null): string {
  return formatApiDateTime(value, 'dd MMM yyyy');
}
