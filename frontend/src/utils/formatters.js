import { format, formatDistanceToNow } from 'date-fns';

export const fmtDate = (d) => format(new Date(d), 'MMM dd, yyyy');
export const fmtDateTime = (d) => format(new Date(d), 'PPpp');
export const fmtRelative = (d) => formatDistanceToNow(new Date(d), { addSuffix: true });
export const fmtNum = (n, dec = 2) => Number(n).toFixed(dec);
export const fmtPct = (n) => `${(n * 100).toFixed(1)}%`;

export const riskLabel = (score) => {
  if (score < 25) return 'Low';
  if (score < 50) return 'Medium';
  if (score < 75) return 'High';
  return 'Critical';
};

export const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
