import { WardBreakdownRow } from '../types';
import { formatNumber } from '../utils/format';

interface WardBreakdownProps {
  rows: WardBreakdownRow[];
  title?: string;
  candidateOrder?: string[];
}

export function WardBreakdown({ rows, title = 'Race', candidateOrder = [] }: WardBreakdownProps) {
  const orderedCandidateNames = new Set(candidateOrder);

  for (const row of rows) {
    for (const candidate of row.candidates) {
      orderedCandidateNames.add(candidate.candidate);
    }
  }

  const wardVotesByCandidate = new Map<string, Map<string, number>>();

  for (const candidateName of orderedCandidateNames) {
    wardVotesByCandidate.set(candidateName, new Map());
  }

  for (const row of rows) {
    for (const candidate of row.candidates) {
      wardVotesByCandidate.get(candidate.candidate)?.set(row.ward, candidate.votes);
    }
  }

  const candidateRows = Array.from(orderedCandidateNames).map((candidateName) => {
    const wardVotes = rows.map((row) => wardVotesByCandidate.get(candidateName)?.get(row.ward) ?? 0);
    const totalVotes = wardVotes.reduce((sum, votes) => sum + votes, 0);

    return {
      candidateName,
      wardVotes,
      totalVotes,
    };
  });

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="overflow-x-auto rounded-lg border border-line">
        <table aria-label={`${title} ward breakdown`} className="min-w-full border-collapse text-sm">
          <thead className="bg-paper/70">
            <tr>
              <th className="border-b border-line px-4 py-3 text-left font-semibold text-ink">Candidate/Item Name</th>
              {rows.map((row) => (
                <th key={`header-${row.ward}`} className="border-b border-line px-4 py-3 text-right font-semibold text-ink">
                  Ward {row.ward}
                </th>
              ))}
              <th className="border-b border-line px-4 py-3 text-right font-semibold text-ink">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {candidateRows.map((candidateRow) => (
              <tr key={candidateRow.candidateName} className="border-b border-line/70 last:border-b-0">
                <th className="px-4 py-3 text-left font-medium text-slate-700" scope="row">
                  {candidateRow.candidateName}
                </th>
                {candidateRow.wardVotes.map((votes, index) => (
                  <td key={`${candidateRow.candidateName}-${rows[index]?.ward ?? index}`} className="px-4 py-3 text-right font-medium text-ink">
                    {formatNumber(votes)}
                  </td>
                ))}
                <td className="px-4 py-3 text-right font-semibold text-ink">{formatNumber(candidateRow.totalVotes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
