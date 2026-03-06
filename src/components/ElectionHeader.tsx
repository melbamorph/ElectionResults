import { formatUpdatedTimestamp } from '../utils/format';

interface ElectionHeaderProps {
  lastUpdated: Date | null;
  overallFinal: boolean;
  error: string | null;
}

export function ElectionHeader({ lastUpdated, overallFinal, error }: ElectionHeaderProps) {
  return (
    <header className="rounded-2xl border border-line bg-white px-6 py-8 shadow-card animate-rise">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-display uppercase tracking-[0.16em] text-slate">City of Lebanon, New Hampshire</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink md:text-5xl">Municipal Election Results</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate md:text-base">
            Live unofficial results from published town election spreadsheets.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate">Last updated: {formatUpdatedTimestamp(lastUpdated)}</p>
          {overallFinal && (
            <span className="inline-flex w-fit items-center rounded-full border border-winner/30 bg-winner/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-winner">
              All Results Final
            </span>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-4 rounded-lg border border-alert/30 bg-alert/10 p-3 text-sm text-alert" role="status">
          Showing last known data. Refresh issue: {error}
        </p>
      )}
    </header>
  );
}
