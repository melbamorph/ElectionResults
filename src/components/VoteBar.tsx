interface VoteBarProps {
  percent: number;
  isLeader: boolean;
  isWinner: boolean;
}

export function VoteBar({ percent, isLeader, isWinner }: VoteBarProps) {
  const width = Math.max(0, Math.min(100, percent));
  const barClass = isWinner
    ? 'bg-winner'
    : isLeader
      ? 'bg-leader'
      : 'bg-slate-400';

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className={`h-full rounded-full transition-all duration-500 ${barClass}`}
        style={{ width: `${width}%` }}
        aria-hidden
      />
    </div>
  );
}
