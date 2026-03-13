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
    <div className="rounded-xl bg-paper p-4">
      <p className="text-xs uppercase tracking-wide text-slate">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{valueDisplay}</p>

      {hasBreakdown && (
        <div className="mt-3">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={breakdownId}
            aria-label={`${expanded ? 'Hide' : 'Show'} ward breakdown for ${title}`}
            className="text-xs font-semibold text-clay hover:underline"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? 'Hide ward breakdown' : 'Show ward breakdown'}
          </button>

          {expanded && (
            <ul id={breakdownId} aria-label={`${title} ward breakdown`} className="mt-2 rounded-md border border-line/70 bg-white p-2 text-xs">
              {breakdownRows.map((row) => (
                <li key={`${title}-${row.ward}`} className="flex items-center justify-between py-0.5">
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
    <section className="rounded-2xl border border-line bg-white p-6 shadow-card animate-rise">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Election Dashboard</h2>
          <p className="mt-2 text-sm text-slate">
            {summary.reportedWards} of {summary.totalWards} wards reporting ({formatPercent(summary.percentReporting, 0)})
            {summary.isFinal ? ' Final ward reporting complete.' : ''}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
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

