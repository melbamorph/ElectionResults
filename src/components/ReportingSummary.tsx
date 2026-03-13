import { useId, useState } from 'react';
import { ReportingSummaryData, WardStatusRow, WardTurnoutBreakdownRow } from '../types';
import { formatNumber, formatPercent, titleCase } from '../utils/format';
import { statusChipClass, statusSymbol } from './statusStyles';

interface ReportingSummaryProps {
  summary: ReportingSummaryData;
  wards: WardStatusRow[];
  selectedWard: string | null;
  onSelectWard: (ward: string) => void;
  onResetWard: () => void;
}

interface SummaryMetricCardProps {
  title: string;
  valueDisplay: string;
  breakdownRows: WardTurnoutBreakdownRow[];
  renderBreakdownValue: (row: WardTurnoutBreakdownRow) => string;
}

function SummaryMetricCard({ title, valueDisplay, breakdownRows, renderBreakdownValue }: SummaryMetricCardProps) {
  const [expanded, setExpanded] = useState(false);
  const breakdownId = useId();
  const hasBreakdown = breakdownRows.length > 0;

  return (
    <div className="rounded-xl bg-paper p-4 sm:p-5">
      <p className="text-sm uppercase tracking-wide text-slate">{title}</p>
      <p className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">{valueDisplay}</p>

      {hasBreakdown && (
        <div className="mt-3">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={breakdownId}
            aria-label={`${expanded ? 'Hide' : 'Show'} ward breakdown for ${title}`}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-clay hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/15"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? 'Hide ward breakdown' : 'Show ward breakdown'}
          </button>

          {expanded && (
            <ul
              id={breakdownId}
              aria-label={`${title} ward breakdown`}
              className="mt-2 rounded-md border border-line/70 bg-white p-3 text-sm"
            >
              {breakdownRows.map((row) => (
                <li key={`${title}-${row.ward}`} className="flex items-center justify-between gap-4 py-1">
                  <span className="text-slate">Ward {row.ward}</span>
                  <span className="font-semibold text-ink">{renderBreakdownValue(row)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function ReportingSummary({
  summary,
  wards,
  selectedWard,
  onSelectWard,
  onResetWard,
}: ReportingSummaryProps) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-card animate-rise sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Election Dashboard</h2>
          <p className="mt-2 text-base text-slate">
            {summary.reportedWards} of {summary.totalWards} wards reporting ({formatPercent(summary.percentReporting, 0)})
            {summary.isFinal ? ' Final ward reporting complete.' : ''}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryMetricCard
          title="Ballots Cast"
          valueDisplay={formatNumber(summary.ballotsCounted)}
          breakdownRows={summary.turnoutByWard}
          renderBreakdownValue={(row) => formatNumber(row.ballotsCounted)}
        />
        <SummaryMetricCard
          title="Registered Voters"
          valueDisplay={formatNumber(summary.registeredVoters)}
          breakdownRows={summary.turnoutByWard}
          renderBreakdownValue={(row) => formatNumber(row.registeredVoters)}
        />
        <SummaryMetricCard
          title="Voter Turnout"
          valueDisplay={formatPercent(summary.turnoutPercentage)}
          breakdownRows={summary.turnoutByWard}
          renderBreakdownValue={(row) =>
            formatPercent(row.registeredVoters > 0 ? (row.ballotsCounted / row.registeredVoters) * 100 : 0)
          }
        />
      </div>

      {wards.length > 0 && (
        <section className="mt-5 rounded-xl border border-line bg-paper/35 p-4 sm:p-5">
          <div>
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <h3 className="font-display text-lg font-semibold text-ink">Ward Reporting Status</h3>
                <button
                  type="button"
                  onClick={onResetWard}
                  disabled={!selectedWard}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold uppercase tracking-wide text-ink transition hover:border-slate hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/15 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line disabled:hover:bg-paper"
                >
                  Clear Ward Filter
                </button>
              </div>
              <p className="mt-2 text-sm text-slate">
                Click a ward card to filter Municipal Results by that ward. On mobile, tap the card instead.
              </p>
              {selectedWard && (
                <p className="mt-1 text-sm font-medium text-ink">Currently filtering for Ward {selectedWard}.</p>
              )}
            </div>
          </div>

          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {wards.map((ward) => {
              const isSelected = selectedWard === ward.ward;

              return (
                <li key={ward.ward}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Show Ward ${ward.ward} ballot items`}
                    onClick={() => onSelectWard(ward.ward)}
                    className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/20 ${
                      isSelected
                        ? 'border-ink/40 bg-white ring-2 ring-ink/20'
                        : 'border-line bg-white/70 hover:border-slate/60 hover:bg-white'
                    }`}
                  >
                    <span className="text-base font-medium text-ink">Ward {ward.ward}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-semibold uppercase tracking-wide ${statusChipClass(
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

