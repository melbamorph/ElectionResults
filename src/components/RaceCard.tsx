import { ElectionStatus, NormalizedRace } from '../types';
import { formatNumber, titleCase } from '../utils/format';
import { CandidateRow } from './CandidateRow';
import { statusChipClass } from './statusStyles';

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
        {race.candidates.map((candidate) => (
          <CandidateRow key={candidate.candidate} candidate={candidate} compact={compact} />
        ))}
      </div>
    </article>
  );
}
