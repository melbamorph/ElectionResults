import { ReportingSummaryData, WardStatusRow } from '../types';
import { formatNumber, formatPercent, titleCase } from '../utils/format';
import { statusChipClass } from './statusStyles';

interface ReportingSummaryProps {
  summary: ReportingSummaryData;
  wards: WardStatusRow[];
}

function statusIcon(status: WardStatusRow['status']): string {
  switch (status) {
    case 'FINAL':
      return 'OK';
    case 'REPORTED':
      return 'OK';
    case 'COUNTING':
      return '...';
    default:
      return 'o';
  }
}

export function ReportingSummary({ summary, wards }: ReportingSummaryProps) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-card animate-rise">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Election Dashboard</h2>
          <p className="mt-2 text-sm text-slate">
            {summary.reportedWards} of {summary.totalWards} wards reporting ({formatPercent(summary.percentReporting, 0)})
          </p>
        </div>
        {summary.isFinal && (
          <p className="inline-flex rounded-full border border-winner/30 bg-winner/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-winner">
            Ward Reporting Final
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-paper p-4">
          <p className="text-xs uppercase tracking-wide text-slate">Ballots Counted</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{formatNumber(summary.ballotsCounted)}</p>
        </div>
        <div className="rounded-xl bg-paper p-4">
          <p className="text-xs uppercase tracking-wide text-slate">Registered Voters</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{formatNumber(summary.registeredVoters)}</p>
        </div>
        <div className="rounded-xl bg-paper p-4">
          <p className="text-xs uppercase tracking-wide text-slate">Voter Turnout</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{formatPercent(summary.turnoutPercentage)}</p>
        </div>
      </div>

      {wards.length > 0 && (
        <section className="mt-5 rounded-xl border border-line bg-paper/35 p-4">
          <h3 className="font-display text-base font-semibold text-ink">Ward Reporting Status</h3>
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {wards.map((ward) => (
              <li
                key={ward.ward}
                className="flex items-center justify-between rounded-lg border border-line bg-white/70 px-3 py-2"
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
      )}
    </section>
  );
}
