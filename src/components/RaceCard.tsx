import { useId, useMemo, useState } from 'react';
import { NormalizedRace } from '../types';
import { formatNumber } from '../utils/format';
import { CandidateRow } from './CandidateRow';

interface RaceCardProps {
  race: NormalizedRace;
  compact?: boolean;
  accentClassName?: string;
  layoutMode?: 'card' | 'responsive-list';
}

function getWardBreakdownCandidateKey(candidateName: string): string {
  return candidateName.startsWith('Write-Ins (') ? 'Write-Ins' : candidateName;
}

export function RaceCard({
  race,
  compact = false,
  accentClassName = 'bg-smoke/40',
  layoutMode = 'card',
}: RaceCardProps) {
  const [wardBreakdownExpanded, setWardBreakdownExpanded] = useState(false);
  const wardBreakdownId = useId();
  const showRaceWardBreakdown = race.scope === 'CITYWIDE' && race.wardBreakdown.length > 0;
  const isResponsiveList = layoutMode === 'responsive-list';
  const candidateWardVotes = useMemo(() => {
    const byCandidate = new Map<string, { ward: string; votes: number }[]>();

    for (const wardRow of race.wardBreakdown) {
      for (const candidate of wardRow.candidates) {
        if (!byCandidate.has(candidate.candidate)) {
          byCandidate.set(candidate.candidate, []);
        }

        byCandidate.get(candidate.candidate)?.push({
          ward: wardRow.ward,
          votes: candidate.votes,
        });
      }
    }

    return byCandidate;
  }, [race.wardBreakdown]);

  return (
    <article
      data-layout={layoutMode}
      className={
        isResponsiveList
          ? 'rounded-lg border border-line bg-white/95 p-4 shadow-sm md:grid md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:items-start md:gap-6 md:rounded-none md:border-0 md:bg-transparent md:p-4 md:shadow-none'
          : compact
            ? 'rounded-lg border border-line bg-white/95 p-4 shadow-sm'
            : 'rounded-xl border border-line bg-white p-5 shadow-card sm:p-6'
      }
    >
      {compact && <div className={`mb-3 h-1.5 w-14 rounded-full ${accentClassName} ${isResponsiveList ? 'md:hidden' : ''}`} aria-hidden />}

      <header className={isResponsiveList ? 'md:pr-6' : ''}>
        <div className="min-w-0">
          <h4 className={`font-display font-semibold leading-snug text-ink ${compact ? 'text-lg' : 'text-2xl'}`}>{race.race}</h4>
          {isResponsiveList ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate md:flex-col md:items-start md:gap-1">
              <p className="tabular-nums">Total votes: {formatNumber(race.totalVotes)}</p>
              {race.raceType === 'office' && race.seats > 1 && <p className="uppercase tracking-wide">Vote for {race.seats}</p>}
              {showRaceWardBreakdown && (
                <button
                  type="button"
                  aria-expanded={wardBreakdownExpanded}
                  aria-controls={wardBreakdownId}
                  aria-label={`${wardBreakdownExpanded ? 'Hide' : 'Show'} ward breakdown for ${race.race}`}
                  className="inline-flex min-h-11 items-center font-semibold text-clay hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/15"
                  onClick={() => setWardBreakdownExpanded((current) => !current)}
                >
                  {wardBreakdownExpanded ? 'Hide ward breakdown' : 'Show ward breakdown'}
                </button>
              )}
            </div>
          ) : (
            <>
              <p className={`${compact ? 'text-sm' : 'text-base'} text-slate`}>Total votes: {formatNumber(race.totalVotes)}</p>
              {race.raceType === 'office' && race.seats > 1 && (
                <p className={`${compact ? 'text-sm' : 'text-base'} uppercase tracking-wide text-slate`}>Vote for {race.seats}</p>
              )}
              {showRaceWardBreakdown && (
                <button
                  type="button"
                  aria-expanded={wardBreakdownExpanded}
                  aria-controls={wardBreakdownId}
                  aria-label={`${wardBreakdownExpanded ? 'Hide' : 'Show'} ward breakdown for ${race.race}`}
                  className={`${compact ? 'mt-1 text-sm' : 'mt-2 text-base'} inline-flex min-h-11 items-center font-semibold text-clay hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/15`}
                  onClick={() => setWardBreakdownExpanded((current) => !current)}
                >
                  {wardBreakdownExpanded ? 'Hide ward breakdown' : 'Show ward breakdown'}
                </button>
              )}
            </>
          )}
        </div>
      </header>

      <div
        id={showRaceWardBreakdown ? wardBreakdownId : undefined}
        className={`${compact || isResponsiveList ? 'mt-3 space-y-2' : 'mt-4 space-y-3'} ${
          isResponsiveList ? 'md:mt-0 md:space-y-0 md:divide-y md:divide-line/50' : ''
        }`}
      >
        {race.candidates.map((candidate) => {
          const wardVotes = candidateWardVotes.get(getWardBreakdownCandidateKey(candidate.candidate)) ?? [];

          return (
            <CandidateRow
              key={candidate.candidate}
              candidate={candidate}
              compact={compact}
              wardVotes={wardVotes}
              showWardBreakdown={wardBreakdownExpanded}
              layoutMode={layoutMode}
            />
          );
        })}
      </div>
    </article>
  );
}
