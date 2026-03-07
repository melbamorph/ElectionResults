import { ReportingSummaryData, WardStatusRow } from '../types';
import { formatNumber, formatPercent, titleCase } from '../utils/format';
import { statusChipClass, statusSymbol } from './statusStyles';

interface ReportingSummaryProps {
  summary: ReportingSummaryData;
  wards: WardStatusRow[];
  selectedWard: string | null;
  onSelectWard: (ward: string) => void;
  onResetWard: () => void;
}

export function ReportingSummary({
  summary,
  wards,
  selectedWard,
  onSelectWard,
  onResetWard,
}: ReportingSummaryProps) {
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
          <div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-base font-semibold text-ink">Ward Reporting Status</h3>
                <button
                  type="button"
                  onClick={onResetWard}
                  disabled={!selectedWard}
                  className="inline-flex items-center rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink transition hover:border-slate hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line disabled:hover:bg-paper"
                >
                  Clear Ward Filter
                </button>
              </div>
              <p className="mt-1 text-xs text-slate">Click a ward card to filter Municipal Results by that ward.</p>
              {selectedWard && (
                <p className="mt-1 text-xs font-medium text-ink">Currently filtering for Ward {selectedWard}.</p>
              )}
            </div>
          </div>

          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {wards.map((ward) => {
              const isSelected = selectedWard === ward.ward;

              return (
                <li key={ward.ward}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Show Ward ${ward.ward} ballot items`}
                    onClick={() => onSelectWard(ward.ward)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                      isSelected
                        ? 'border-ink/40 bg-white ring-2 ring-ink/20'
                        : 'border-line bg-white/70 hover:border-slate/60 hover:bg-white'
                    }`}
                  >
                    <span className="text-sm font-medium text-ink">Ward {ward.ward}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-wide ${statusChipClass(
                        ward.status,
                      )}`}
                    >
                      <span aria-hidden>{statusSymbol(ward.status)}</span>
                      {titleCase(ward.status)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </section>
  );
}

