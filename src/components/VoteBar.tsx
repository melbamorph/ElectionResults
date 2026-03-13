interface VoteBarProps {
  percent: number;
  isLeader: boolean;
  isWinner: boolean;
  compact?: boolean;
}

export function VoteBar({ percent, isLeader, isWinner, compact = false }: VoteBarProps) {
  const width = Math.max(0, Math.min(100, percent));
  const barClass = isWinner ? 'bg-winner' : isLeader ? 'bg-clay' : 'bg-smoke/60';

  return (
    <div className={`w-full overflow-hidden rounded-full ${compact ? 'h-2 bg-smoke/20' : 'h-2.5 bg-smoke/20'}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${barClass}`}
        style={{ width: `${width}%` }}
        aria-hidden
      />
    </div>
  );
}
