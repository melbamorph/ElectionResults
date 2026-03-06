import { CandidateResult } from '../types';
import { formatNumber, formatPercent } from '../utils/format';
import { VoteBar } from './VoteBar';

interface CandidateRowProps {
  candidate: CandidateResult;
}

export function CandidateRow({ candidate }: CandidateRowProps) {
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="flex items-center justify-between gap-3">
        <p className={`text-base ${candidate.isLeader ? 'font-semibold text-ink' : 'font-medium text-slate-700'}`}>
          {candidate.candidate}
          {candidate.isWinner && <span className="ml-2 text-xs font-semibold uppercase text-winner">Winner</span>}
        </p>
        <div className="text-right">
          <p className="text-sm font-semibold text-ink">{formatNumber(candidate.votes)}</p>
          <p className="text-xs text-slate">{formatPercent(candidate.percentage)}</p>
        </div>
      </div>
      <div className="mt-2">
        <VoteBar
          percent={candidate.percentage}
          isLeader={candidate.isLeader}
          isWinner={candidate.isWinner}
        />
      </div>
    </div>
  );
}
