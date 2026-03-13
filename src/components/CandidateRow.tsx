import { CandidateResult } from '../types';
import { formatNumber } from '../utils/format';
import { VoteBar } from './VoteBar';

interface CandidateWardVote {
  ward: string;
  votes: number;
}

interface CandidateRowProps {
  candidate: CandidateResult;
  compact?: boolean;
  wardVotes?: CandidateWardVote[];
  showWardBreakdown?: boolean;
  layoutMode?: 'card' | 'responsive-list';
}

export function CandidateRow({
  candidate,
  compact = false,
  wardVotes = [],
  showWardBreakdown = false,
  layoutMode = 'card',
}: CandidateRowProps) {
  const isResponsiveList = layoutMode === 'responsive-list';
  const hasWardBreakdown = showWardBreakdown && wardVotes.length > 0;

  return (
    <div
      className={
        compact
          ? `rounded-md border border-line/70 bg-mist px-3 py-3 ${
              isResponsiveList
                ? 'md:grid md:grid-cols-[minmax(0,1.7fr)_minmax(150px,1fr)_9ch] md:items-center md:gap-x-4 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-3'
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
        </div>
      </div>
      <div className={`${compact ? 'mt-1.5' : 'mt-2'} ${isResponsiveList ? 'md:mt-0 md:min-w-0' : ''}`}>
        <VoteBar percent={candidate.percentage} isLeader={candidate.isLeader} isWinner={candidate.isWinner} compact={compact} />
      </div>

      {isResponsiveList && (
        <p className="hidden text-right text-base font-semibold text-ink tabular-nums md:block">{formatNumber(candidate.votes)}</p>
      )}

      {hasWardBreakdown && (
        <ul
          className={`${compact ? 'mt-2 gap-2 text-sm' : 'mt-3 gap-3 text-sm'} grid rounded-md border border-line/70 bg-white/80 p-3 ${
            isResponsiveList ? 'md:col-span-3 md:rounded-none md:border-0 md:bg-transparent md:p-0' : ''
          }`}
          aria-label={`${candidate.candidate} ward breakdown`}
        >
          {wardVotes.map((wardVote) => (
            <li
              key={`${candidate.candidate}-${wardVote.ward}`}
              className={`rounded-sm bg-paper/60 px-3 py-2 ${
                isResponsiveList
                  ? 'md:grid md:grid-cols-[minmax(0,1.7fr)_minmax(150px,1fr)_9ch] md:items-center md:gap-x-4 md:px-0'
                  : 'flex items-center justify-between gap-3'
              }`}
            >
              <span className={`text-slate ${isResponsiveList ? 'md:col-start-2' : ''}`}>Ward {wardVote.ward}</span>
              <span className={`font-semibold text-ink ${isResponsiveList ? 'md:col-start-3 md:text-right' : ''}`}>
                {formatNumber(wardVote.votes)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
