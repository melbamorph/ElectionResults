import { WardStatusRow } from '../types';
import { titleCase } from '../utils/format';
import { statusChipClass } from './statusStyles';

interface WardStatusTrackerProps {
  wards: WardStatusRow[];
}

function statusIcon(status: WardStatusRow['status']): string {
  switch (status) {
    case 'FINAL':
      return '✓';
    case 'REPORTED':
      return '✓';
    case 'COUNTING':
      return '⏳';
    default:
      return '○';
  }
}

export function WardStatusTracker({ wards }: WardStatusTrackerProps) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-card">
      <h3 className="font-display text-lg font-semibold text-ink">Ward Reporting Status</h3>
      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {wards.map((ward) => (
          <li
            key={ward.ward}
            className="flex items-center justify-between rounded-lg border border-line px-3 py-2"
          >
            <span className="text-sm font-medium text-ink">Ward {ward.ward}</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-wide ${statusChipClass(
                ward.status,
              )}`}
            >
              <span aria-hidden>{statusIcon(ward.status)}</span>
              {titleCase(ward.status)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
