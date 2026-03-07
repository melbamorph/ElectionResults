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
}

export function CandidateRow({ candidate, compact = false, wardVotes = [] }: CandidateRowProps) {
  const [wardBreakdownExpanded, setWardBreakdownExpanded] = useState(false);
  const hasWardBreakdown = wardVotes.length > 0;

  return (
    <div
      className={
        compact
          ? 'rounded-md border border-line/70 bg-mist px-2.5 py-2'
          : 'rounded-lg border border-line p-3'
      }
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={`${compact ? 'text-sm' : 'text-base'} ${
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
        <div className="text-right">
          <p className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-ink`}>{formatNumber(candidate.votes)}</p>
          <p className={`${compact ? 'text-[11px]' : 'text-xs'} text-slate`}>{formatPercent(candidate.percentage)}</p>
        </div>
      </div>
      <div className={compact ? 'mt-1.5' : 'mt-2'}>
        <VoteBar percent={candidate.percentage} isLeader={candidate.isLeader} isWinner={candidate.isWinner} compact={compact} />
      </div>

      {hasWardBreakdown && (
        <div className={compact ? 'mt-1.5' : 'mt-2'}>
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
