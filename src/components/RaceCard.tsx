import { useMemo, useState } from 'react';
import { ElectionStatus, NormalizedRace } from '../types';
import { titleCase } from '../utils/format';
import { CandidateRow } from './CandidateRow';
import { statusChipClass } from './statusStyles';
import { WardBreakdown } from './WardBreakdown';

interface RaceCardProps {
  race: NormalizedRace;
  electionStatus: ElectionStatus;
}

export function RaceCard({ race, electionStatus }: RaceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasWardBreakdown = useMemo(
    () => race.election === 'CITY' && race.wardBreakdown.length > 0,
    [race.election, race.wardBreakdown.length],
  );

  return (
    <article className="rounded-xl border border-line bg-white p-5 shadow-card">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="font-display text-xl font-semibold text-ink">{race.race}</h4>
          {race.raceType === 'office' && race.seats > 1 && (
            <p className="text-xs uppercase tracking-wide text-slate">Vote for {race.seats}</p>
          )}
        </div>
        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusChipClass(
            electionStatus,
          )}`}
        >
          {titleCase(electionStatus)}
        </span>
      </header>

      <div className="mt-4 space-y-3">
        {race.candidates.map((candidate) => (
          <CandidateRow key={candidate.candidate} candidate={candidate} />
        ))}
      </div>

      {hasWardBreakdown && (
        <div className="mt-4">
          <button
            type="button"
            className="text-sm font-semibold text-leader hover:underline"
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
