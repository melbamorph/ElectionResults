import { ElectionStatus } from '../types';

export function statusChipClass(status: ElectionStatus): string {
  switch (status) {
    case 'FINAL':
      return 'bg-winner/15 text-winner border-winner/30';
    case 'REPORTED':
      return 'bg-leader/15 text-leader border-leader/30';
    case 'COUNTING':
      return 'bg-alert/15 text-alert border-alert/30';
    default:
      return 'bg-slate-200 text-slate-700 border-slate-300';
  }
}
