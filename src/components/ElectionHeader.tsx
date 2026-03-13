import { appTheme } from '../theme';
import { formatUpdatedTimestamp } from '../utils/format';

interface ElectionHeaderProps {
  lastUpdated: Date | null;
  overallFinal: boolean;
  error: string | null;
}

export function ElectionHeader({ lastUpdated, overallFinal, error }: ElectionHeaderProps) {
  return (
    <header className="rounded-2xl border border-line bg-white px-5 py-6 shadow-card animate-rise sm:px-6 sm:py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-display uppercase tracking-[0.16em] text-slate sm:text-base">{appTheme.locationLabel}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
            {appTheme.dashboardHeading}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate md:text-lg">{appTheme.dashboardSubheading}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-base text-slate">Last updated: {formatUpdatedTimestamp(lastUpdated)}</p>
          {overallFinal && (
            <span className="inline-flex min-h-11 w-fit items-center rounded-full border border-winner/30 bg-winner/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-winner">
              All Results Final
            </span>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-4 rounded-lg border border-alert/30 bg-alert/10 p-4 text-base text-alert" role="status">
          Showing last known data. Refresh issue: {error}
        </p>
      )}
    </header>
  );
}
