import { useState } from 'react';
import { CandidateResult } from '../types';
import { formatNumber, formatPercent } from '../utils/format';
import { VoteBar } from './VoteBar';

interface CandidateWardVote {
  ward: string;
  votes: number;
}

interface CandidateRowProps {
  candidate: CandidateResult;
  compact?: boolean;
  wardVotes?: CandidateWardVote[];
  layoutMode?: 'card' | 'responsive-list';
}

export function CandidateRow({
  candidate,
  compact = false,
  wardVotes = [],
  layoutMode = 'card',
}: CandidateRowProps) {
  const [wardBreakdownExpanded, setWardBreakdownExpanded] = useState(false);
  const hasWardBreakdown = wardVotes.length > 0;
  const isResponsiveList = layoutMode === 'responsive-list';

  return (
    <div
      className={
        compact
          ? `rounded-md border border-line/70 bg-mist px-3 py-3 ${
              isResponsiveList
                ? 'md:grid md:grid-cols-[minmax(0,1.7fr)_minmax(150px,1fr)_9ch_6ch] md:items-center md:gap-x-4 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-3'
                : ''
            }`
          : 'rounded-lg border border-line p-4'
      }
    >
      <div className={`flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between ${isResponsiveList ? 'md:block md:min-w-0' : ''}`}>
        <p
          className={`${compact ? 'text-base' : 'text-lg'} min-w-0 leading-snug ${
            candidate.isLeader ? 'font-semibold text-ink' : 'font-medium text-slate-700'
          }`}
        >
          {candidate.candidate}
          {candidate.isWinner && (
            <span className={`${compact ? 'ml-2 text-xs' : 'ml-2 text-sm'} font-semibold uppercase text-winner`}>
              Winner
            </span>
          )}
        </p>
        <div className={`tabular-nums ${isResponsiveList ? 'md:hidden' : 'text-left sm:text-right'}`}>
          <p className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-ink`}>{formatNumber(candidate.votes)}</p>
          <p className={`${compact ? 'text-sm' : 'text-base'} text-slate`}>{formatPercent(candidate.percentage)}</p>
        </div>
      </div>
      <div className={`${compact ? 'mt-1.5' : 'mt-2'} ${isResponsiveList ? 'md:mt-0 md:min-w-0' : ''}`}>
        <VoteBar percent={candidate.percentage} isLeader={candidate.isLeader} isWinner={candidate.isWinner} compact={compact} />
      </div>

      {isResponsiveList && (
        <>
          <p className="hidden text-right text-base font-semibold text-ink tabular-nums md:block">
            {formatNumber(candidate.votes)}
          </p>
          <p className="hidden text-right text-base text-slate tabular-nums md:block">{formatPercent(candidate.percentage)}</p>
        </>
      )}

      {hasWardBreakdown && (
        <div className={`${compact ? 'mt-1.5' : 'mt-2'} ${isResponsiveList ? 'md:col-span-4' : ''}`}>
          <button
            type="button"
            className={`${compact ? 'text-sm' : 'text-base'} inline-flex min-h-11 items-center font-semibold text-clay hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/15`}
            aria-label={`${wardBreakdownExpanded ? 'Hide' : 'Show'} ward breakdown for ${candidate.candidate}`}
            onClick={() => setWardBreakdownExpanded((current) => !current)}
          >
            {wardBreakdownExpanded ? 'Hide ward breakdown' : 'Show ward breakdown'}
          </button>

          {wardBreakdownExpanded && (
            <ul className={`${compact ? 'mt-1.5 text-sm' : 'mt-2 text-base'} rounded-md border border-line/70 bg-white p-3`}>
              {wardVotes.map((wardVote) => (
                <li key={`${candidate.candidate}-${wardVote.ward}`} className="flex items-center justify-between gap-4 py-1">
                  <span className="text-slate">Ward {wardVote.ward}</span>
                  <span className="font-semibold text-ink">{formatNumber(wardVote.votes)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
