import { ElectionStatus } from '../types';

export function statusChipClass(status: ElectionStatus): string {
  switch (status) {
    case 'FINAL':
      return 'bg-winner/15 text-winner border-winner/30';
    case 'REPORTED':
      return 'bg-clay/15 text-clay border-clay/30';
    case 'COUNTING':
      return 'bg-alert/15 text-alert border-alert/30';
    default:
      return 'bg-smoke/10 text-smoke border-smoke/30';
  }
}
