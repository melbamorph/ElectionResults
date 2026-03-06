import { WardBreakdownRow } from '../types';
import { formatNumber, formatPercent } from '../utils/format';

interface WardBreakdownProps {
  rows: WardBreakdownRow[];
}

export function WardBreakdown({ rows }: WardBreakdownProps) {
  return (
    <div className="mt-4 space-y-3 border-t border-line pt-4">
      {rows.map((row) => (
        <section key={row.ward} className="rounded-lg border border-line p-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold text-ink">Ward {row.ward}</h5>
            <p className="text-xs text-slate">Total votes: {formatNumber(row.totalVotes)}</p>
          </div>
          <ul className="mt-2 space-y-1">
            {row.candidates.map((candidate) => (
              <li key={candidate.candidate} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{candidate.candidate}</span>
                <span className="font-medium text-ink">
                  {formatNumber(candidate.votes)} ({formatPercent(candidate.percentage)})
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
