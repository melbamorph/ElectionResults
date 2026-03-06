import { ReportingSummaryData } from '../types';
import { formatNumber, formatPercent } from '../utils/format';

interface ReportingSummaryProps {
  summary: ReportingSummaryData;
}

export function ReportingSummary({ summary }: ReportingSummaryProps) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-card animate-rise">
      <h2 className="font-display text-xl font-semibold text-ink">Results Status</h2>
      <p className="mt-2 text-sm text-slate">
        {summary.reportedWards} of {summary.totalWards} wards reporting ({formatPercent(summary.percentReporting, 0)})
      </p>
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
      {summary.isFinal && (
        <p className="mt-4 inline-flex rounded-full border border-winner/30 bg-winner/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-winner">
          Ward Reporting Final
        </p>
      )}
    </section>
  );
}
