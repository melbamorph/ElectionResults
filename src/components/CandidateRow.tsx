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
          ? `rounded-md border border-line/70 bg-mist px-2.5 py-2 ${
              isResponsiveList
                ? 'md:grid md:grid-cols-[minmax(0,1.7fr)_minmax(150px,1fr)_auto_auto] md:items-center md:gap-x-4 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-3'
                : ''
            }`
          : 'rounded-lg border border-line p-3'
      }
    >
      <div className={`flex items-center justify-between gap-3 ${isResponsiveList ? 'md:block md:min-w-0' : ''}`}>
        <p
          className={`${compact ? 'text-sm' : 'text-base'} min-w-0 ${
            candidate.isLeader ? 'font-semibold text-ink' : 'font-medium text-slate-700'
          }`}
        >
          {candidate.candidate}
          {candidate.isWinner && (
            <span className={`${compact ? 'ml-1.5 text-[10px]' : 'ml-2 text-xs'} font-semibold uppercase text-winner`}>
              Winner
            </span>
          )}
        </p>
        <div className={`text-right tabular-nums ${isResponsiveList ? 'md:hidden' : ''}`}>
          <p className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-ink`}>{formatNumber(candidate.votes)}</p>
          <p className={`${compact ? 'text-[11px]' : 'text-xs'} text-slate`}>{formatPercent(candidate.percentage)}</p>
        </div>
      </div>
      <div className={`${compact ? 'mt-1.5' : 'mt-2'} ${isResponsiveList ? 'md:mt-0' : ''}`}>
        <VoteBar percent={candidate.percentage} isLeader={candidate.isLeader} isWinner={candidate.isWinner} compact={compact} />
      </div>

      {isResponsiveList && (
        <>
          <p className="hidden text-right text-sm font-semibold text-ink tabular-nums md:block">
            {formatNumber(candidate.votes)}
          </p>
          <p className="hidden text-right text-sm text-slate tabular-nums md:block">{formatPercent(candidate.percentage)}</p>
        </>
      )}

      {hasWardBreakdown && (
        <div className={`${compact ? 'mt-1.5' : 'mt-2'} ${isResponsiveList ? 'md:col-span-4' : ''}`}>
          <button
            type="button"
            className={`${compact ? 'text-[11px]' : 'text-xs'} font-semibold text-clay hover:underline`}
            aria-label={`${wardBreakdownExpanded ? 'Hide' : 'Show'} ward breakdown for ${candidate.candidate}`}
            onClick={() => setWardBreakdownExpanded((current) => !current)}
          >
            {wardBreakdownExpanded ? 'Hide ward breakdown' : 'Show ward breakdown'}
          </button>

          {wardBreakdownExpanded && (
            <ul className={`${compact ? 'mt-1.5 text-[11px]' : 'mt-2 text-xs'} rounded-md border border-line/70 bg-white p-2`}>
              {wardVotes.map((wardVote) => (
                <li key={`${candidate.candidate}-${wardVote.ward}`} className="flex items-center justify-between py-0.5">
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
