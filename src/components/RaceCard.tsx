import { useMemo } from 'react';
import { NormalizedRace } from '../types';
import { formatNumber } from '../utils/format';
import { CandidateRow } from './CandidateRow';

interface RaceCardProps {
  race: NormalizedRace;
  compact?: boolean;
  accentClassName?: string;
  layoutMode?: 'card' | 'responsive-list';
}

function toWardSortValue(ward: string): number {
  const parsed = Number.parseInt(ward, 10);
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}

export function RaceCard({
  race,
  compact = false,
  accentClassName = 'bg-smoke/40',
  layoutMode = 'card',
}: RaceCardProps) {
  const showCandidateWardBreakdown = race.scope === 'CITYWIDE' && race.wardBreakdown.length > 0;
  const isResponsiveList = layoutMode === 'responsive-list';

  const candidateWardVotes = useMemo(() => {
    const byCandidate = new Map<string, { ward: string; votes: number }[]>();

    if (!showCandidateWardBreakdown) {
      return byCandidate;
    }

    for (const wardRow of race.wardBreakdown) {
      for (const candidate of wardRow.candidates) {
        if (!byCandidate.has(candidate.candidate)) {
          byCandidate.set(candidate.candidate, []);
        }

        const rows = byCandidate.get(candidate.candidate);
        if (!rows) {
          continue;
        }

        rows.push({
          ward: wardRow.ward,
          votes: candidate.votes,
        });
      }
    }

    for (const rows of byCandidate.values()) {
      rows.sort((a, b) => toWardSortValue(a.ward) - toWardSortValue(b.ward));
    }

    return byCandidate;
  }, [race.wardBreakdown, showCandidateWardBreakdown]);

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
            </div>
          ) : (
            <>
              <p className={`${compact ? 'text-sm' : 'text-base'} text-slate`}>Total votes: {formatNumber(race.totalVotes)}</p>
              {race.raceType === 'office' && race.seats > 1 && (
                <p className={`${compact ? 'text-sm' : 'text-base'} uppercase tracking-wide text-slate`}>Vote for {race.seats}</p>
              )}
            </>
          )}
        </div>
      </header>

      <div
        className={`${compact || isResponsiveList ? 'mt-3 space-y-2' : 'mt-4 space-y-3'} ${
          isResponsiveList ? 'md:mt-0 md:space-y-0 md:divide-y md:divide-line/50' : ''
        }`}
      >
        {race.candidates.map((candidate) => {
          const candidateName = candidate.candidate.startsWith('Write-Ins (') ? 'Write-Ins' : candidate.candidate;
          const wardVotes = candidateWardVotes.get(candidateName) || [];

          return (
            <CandidateRow
              key={candidate.candidate}
              candidate={candidate}
              compact={compact}
              wardVotes={wardVotes}
              layoutMode={layoutMode}
            />
          );
        })}
      </div>
    </article>
  );
}
