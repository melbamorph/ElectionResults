import { useMemo, useState } from 'react';
import { ElectionStatus, NormalizedRace } from '../types';
import { formatNumber, titleCase } from '../utils/format';
import { CandidateRow } from './CandidateRow';
import { statusChipClass } from './statusStyles';
import { WardBreakdown } from './WardBreakdown';

interface RaceCardProps {
  race: NormalizedRace;
  electionStatus: ElectionStatus;
  compact?: boolean;
  accentClassName?: string;
}

function toWardSortValue(ward: string): number {
  const parsed = Number.parseInt(ward, 10);
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}

export function RaceCard({
  race,
  electionStatus,
  compact = false,
  accentClassName = 'bg-smoke/40',
}: RaceCardProps) {
  const [breakdownExpanded, setBreakdownExpanded] = useState(false);
  const showWardBreakdown = race.scope === 'CITYWIDE' && race.wardBreakdown.length > 0;

  const candidateWardVotes = useMemo(() => {
    const byCandidate = new Map<string, { ward: string; votes: number }[]>();

    if (!showWardBreakdown) {
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
  }, [race.wardBreakdown, showWardBreakdown]);

  return (
    <article
      className={
        compact
          ? 'rounded-lg border border-line bg-white/95 p-3 shadow-sm'
          : 'rounded-xl border border-line bg-white p-5 shadow-card'
      }
    >
      {compact && <div className={`mb-2 h-1 w-12 rounded-full ${accentClassName}`} aria-hidden />}

      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className={`font-display font-semibold text-ink ${compact ? 'text-base' : 'text-xl'}`}>{race.race}</h4>
          <p className={`${compact ? 'text-[11px]' : 'text-xs'} text-slate`}>Total votes: {formatNumber(race.totalVotes)}</p>
          {race.raceType === 'office' && race.seats > 1 && (
            <p className={`${compact ? 'text-[11px]' : 'text-xs'} uppercase tracking-wide text-slate`}>Vote for {race.seats}</p>
          )}
        </div>
        <span
          className={`inline-flex w-fit rounded-full border font-semibold uppercase tracking-wide ${statusChipClass(
            electionStatus,
          )} ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'}`}
        >
          {titleCase(electionStatus)}
        </span>
      </header>

      <div className={`${compact ? 'mt-3 space-y-2' : 'mt-4 space-y-3'}`}>
        {race.candidates.map((candidate) => {
          const candidateName = candidate.candidate.startsWith('Write-Ins (') ? 'Write-Ins' : candidate.candidate;
          const wardVotes = candidateWardVotes.get(candidateName) || [];

          return <CandidateRow key={candidate.candidate} candidate={candidate} compact={compact} wardVotes={wardVotes} />;
        })}
      </div>

      {showWardBreakdown && (
        <div className="mt-4">
          <button
            type="button"
            className="text-sm font-semibold text-clay hover:underline"
            onClick={() => setBreakdownExpanded((current) => !current)}
          >
            {breakdownExpanded ? 'Hide ward breakdown' : 'Show ward breakdown'}
          </button>
          {breakdownExpanded && <WardBreakdown rows={race.wardBreakdown} />}
        </div>
      )}
    </article>
  );
}
