import { useMemo, useState } from 'react';
import { ElectionStatus, NormalizedRace } from '../types';
import { titleCase } from '../utils/format';
import { CandidateRow } from './CandidateRow';
import { statusChipClass } from './statusStyles';
import { WardBreakdown } from './WardBreakdown';

interface RaceCardProps {
  race: NormalizedRace;
  electionStatus: ElectionStatus;
  compact?: boolean;
  accentClassName?: string;
}

export function RaceCard({
  race,
  electionStatus,
  compact = false,
  accentClassName = 'bg-smoke/40',
}: RaceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasWardBreakdown = useMemo(
    () => race.election === 'CITY' && race.wardBreakdown.length > 0,
    [race.election, race.wardBreakdown.length],
  );

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
        {race.candidates.map((candidate) => (
          <CandidateRow key={candidate.candidate} candidate={candidate} compact={compact} />
        ))}
      </div>

      {hasWardBreakdown && (
        <div className="mt-4">
          <button
            type="button"
            className="text-sm font-semibold text-clay hover:underline"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? 'Hide ward breakdown' : 'Show ward breakdown'}
          </button>
          {expanded && <WardBreakdown rows={race.wardBreakdown} />}
        </div>
      )}
    </article>
  );
}
