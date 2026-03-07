import {
  CandidateResult,
  DashboardData,
  ElectionId,
  ElectionSectionData,
  ElectionStatus,
  ElectionStatusRow,
  NormalizedRace,
  RaceConfigRow,
  RaceType,
  ReportingSummaryData,
  ResultRow,
  TurnoutRow,
  WardBreakdownRow,
  WardStatusRow,
} from '../types';
import { appTheme } from '../theme';
import { parseBoolSafe, parseCsvObjects, parseIntSafe } from './csv';

const VALID_ELECTIONS: ElectionId[] = ['CITY', 'SCHOOL'];
const VALID_STATUSES: ElectionStatus[] = ['PENDING', 'COUNTING', 'REPORTED', 'FINAL'];
const VALID_RACE_TYPES: RaceType[] = ['office', 'ballot'];

const RESULTS_HEADERS = ['election', 'race', 'ward', 'candidate', 'votes'];
const WARD_STATUS_HEADERS = ['ward', 'status'];
const ELECTION_STATUS_HEADERS = ['election', 'status'];
const TURNOUT_HEADERS = ['election', 'ward', 'ballots_counted', 'registered_voters'];
const RACE_CONFIG_HEADERS = [
  'election',
  'race',
  'race_type',
  'scope',
  'ward',
  'seats',
  'sort_order',
  'show_in_key_races',
  'enabled',
];

const WRITE_INS_LABEL = 'Write-Ins';
const WRITE_INS_PATTERN = /^write[\s-]*ins?$/i;
const WARD_COLUMN_PATTERN = /^ward_(.+)$/i;

function normalizeCandidateName(value: string): string {
  const normalized = value.trim();
  return WRITE_INS_PATTERN.test(normalized) ? WRITE_INS_LABEL : normalized;
}

function normalizeWriteInWinnerName(value: string | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function getDisplayCandidateName(candidate: string, isWinner: boolean, writeInWinnerName: string | null): string {
  if (candidate !== WRITE_INS_LABEL || !isWinner || !writeInWinnerName) {
    return candidate;
  }

  return `${WRITE_INS_LABEL} (${writeInWinnerName})`;
}

function assertElection(value: string, field: string): ElectionId {
  const normalized = value.trim().toUpperCase() as ElectionId;
  if (!VALID_ELECTIONS.includes(normalized)) {
    throw new Error(`Invalid election in ${field}: ${value}`);
  }
  return normalized;
}

function assertStatus(value: string, field: string): ElectionStatus {
  const normalized = value.trim().toUpperCase() as ElectionStatus;
  if (!VALID_STATUSES.includes(normalized)) {
    throw new Error(`Invalid status in ${field}: ${value}`);
  }
  return normalized;
}

function assertRaceType(value: string, field: string): RaceType {
  const normalized = value.trim().toLowerCase() as RaceType;
  if (!VALID_RACE_TYPES.includes(normalized)) {
    throw new Error(`Invalid race_type in ${field}: ${value}`);
  }
  return normalized;
}

function normalizeWard(value: string): string {
  return value.trim().toUpperCase() === 'ALL' ? 'ALL' : value.trim();
}

function normalizeRaceGroup(value: string | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function raceKey(election: ElectionId, race: string): string {
  return `${election}::${race}`;
}

function parseWardVotesFromResultsRow(row: Record<string, string>): Record<string, number> | undefined {
  const wardVotes: Record<string, number> = {};

  for (const [column, rawValue] of Object.entries(row)) {
    const match = WARD_COLUMN_PATTERN.exec(column);
    if (!match) {
      continue;
    }

    const ward = normalizeWard(match[1]);
    const value = rawValue.trim();
    if (value.length === 0) {
      continue;
    }

    wardVotes[ward] = parseIntSafe(value, `results.${column}`);
  }

  return Object.keys(wardVotes).length > 0 ? wardVotes : undefined;
}

export function parseResultsCsv(text: string): ResultRow[] {
  const rows = parseCsvObjects(text, RESULTS_HEADERS);
  return rows.map((row) => ({
    election: assertElection(row.election, 'results.election'),
    race: row.race,
    ward: normalizeWard(row.ward),
    candidate: row.candidate,
    votes: parseIntSafe(row.votes, 'results.votes'),
    wardVotes: parseWardVotesFromResultsRow(row),
    write_in_winner_name: normalizeWriteInWinnerName(row.write_in_winner_name),
  }));
}

export function parseWardStatusCsv(text: string): WardStatusRow[] {
  const rows = parseCsvObjects(text, WARD_STATUS_HEADERS);
  return rows.map((row) => ({
    ward: normalizeWard(row.ward),
    status: assertStatus(row.status, 'ward_status.status'),
  }));
}

export function parseElectionStatusCsv(text: string): ElectionStatusRow[] {
  const rows = parseCsvObjects(text, ELECTION_STATUS_HEADERS);
  return rows.map((row) => ({
    election: assertElection(row.election, 'election_status.election'),
    status: assertStatus(row.status, 'election_status.status'),
  }));
}

export function parseTurnoutCsv(text: string): TurnoutRow[] {
  const rows = parseCsvObjects(text, TURNOUT_HEADERS);
  return rows.map((row) => ({
    election: assertElection(row.election, 'turnout.election'),
    ward: normalizeWard(row.ward),
    ballots_counted: parseIntSafe(row.ballots_counted, 'turnout.ballots_counted'),
    registered_voters: parseIntSafe(row.registered_voters, 'turnout.registered_voters'),
  }));
}

export function parseRaceConfigCsv(text: string): RaceConfigRow[] {
  const rows = parseCsvObjects(text, RACE_CONFIG_HEADERS);
  return rows.map((row) => ({
    election: assertElection(row.election, 'race_config.election'),
    race: row.race,
    race_type: assertRaceType(row.race_type, 'race_config.race_type'),
    race_group: normalizeRaceGroup(row.race_group),
    scope: row.scope.trim().toUpperCase() === 'WARD' ? 'WARD' : 'CITYWIDE',
    ward: normalizeWard(row.ward),
    seats: parseIntSafe(row.seats, 'race_config.seats'),
    sort_order: parseIntSafe(row.sort_order, 'race_config.sort_order'),
    show_in_key_races: parseBoolSafe(row.show_in_key_races, 'race_config.show_in_key_races'),
    enabled: parseBoolSafe(row.enabled, 'race_config.enabled'),
  }));
}

function buildCandidates(
  raceResults: ResultRow[],
  seats: number,
  raceType: RaceType,
  electionStatus: ElectionStatus,
): CandidateResult[] {
  const totalsByCandidate = new Map<string, number>();
  let writeInWinnerName: string | null = null;
  let hasExplicitWriteInsRow = false;

  for (const row of raceResults) {
    const candidateName = normalizeCandidateName(row.candidate);
    totalsByCandidate.set(candidateName, (totalsByCandidate.get(candidateName) || 0) + row.votes);

    if (candidateName !== WRITE_INS_LABEL) {
      continue;
    }

    hasExplicitWriteInsRow = true;
    if (row.write_in_winner_name) {
      writeInWinnerName = row.write_in_winner_name;
    }
  }

  if (raceType === 'office' && !hasExplicitWriteInsRow) {
    totalsByCandidate.set(WRITE_INS_LABEL, 0);
  }

  const totalVotes = Array.from(totalsByCandidate.values()).reduce((sum, v) => sum + v, 0);

  const sortedCandidates = Array.from(totalsByCandidate.entries())
    .map(([candidate, votes]) => ({ candidate, votes }))
    .sort((a, b) => {
      if (b.votes !== a.votes) {
        return b.votes - a.votes;
      }
      return a.candidate.localeCompare(b.candidate);
    });

  const canCallWinners = electionStatus === 'REPORTED' || electionStatus === 'FINAL';

  return sortedCandidates.map((item, index) => {
    let isWinner = canCallWinners && raceType === 'office' && index < seats;
    if (item.candidate === WRITE_INS_LABEL && !hasExplicitWriteInsRow && item.votes === 0) {
      isWinner = false;
    }

    return {
      candidate: getDisplayCandidateName(item.candidate, isWinner, writeInWinnerName),
      votes: item.votes,
      percentage: totalVotes > 0 ? (item.votes / totalVotes) * 100 : 0,
      rank: index + 1,
      isLeader: index === 0,
      isWinner,
    };
  });
}
function buildWardBreakdownRows(byWard: Map<string, Map<string, number>>): WardBreakdownRow[] {
  return Array.from(byWard.entries())
    .sort((a, b) => Number.parseInt(a[0], 10) - Number.parseInt(b[0], 10))
    .map(([ward, candidateVotes]) => {
      const totalVotes = Array.from(candidateVotes.values()).reduce((sum, v) => sum + v, 0);
      const candidates = Array.from(candidateVotes.entries())
        .map(([candidate, votes]) => ({
          candidate,
          votes,
          percentage: totalVotes > 0 ? (votes / totalVotes) * 100 : 0,
        }))
        .sort((a, b) => {
          if (b.votes !== a.votes) {
            return b.votes - a.votes;
          }
          return a.candidate.localeCompare(b.candidate);
        });

      return {
        ward,
        totalVotes,
        candidates,
      };
    });
}

function buildWardBreakdownFromColumns(raceResults: ResultRow[]): WardBreakdownRow[] {
  const byWard = new Map<string, Map<string, number>>();

  for (const row of raceResults) {
    if (!row.wardVotes) {
      continue;
    }

    const candidateName = normalizeCandidateName(row.candidate);
    for (const [ward, votes] of Object.entries(row.wardVotes)) {
      if (ward === 'ALL') {
        continue;
      }

      if (!byWard.has(ward)) {
        byWard.set(ward, new Map<string, number>());
      }

      const wardCandidates = byWard.get(ward);
      if (!wardCandidates) {
        continue;
      }

      wardCandidates.set(candidateName, (wardCandidates.get(candidateName) || 0) + votes);
    }
  }

  if (byWard.size === 0) {
    return [];
  }

  return buildWardBreakdownRows(byWard);
}

function buildWardBreakdownFromWardRows(raceResults: ResultRow[]): WardBreakdownRow[] {
  const wardRows = raceResults.filter((row) => row.ward !== 'ALL');
  if (wardRows.length === 0) {
    return [];
  }

  const byWard = new Map<string, Map<string, number>>();
  for (const row of wardRows) {
    if (!byWard.has(row.ward)) {
      byWard.set(row.ward, new Map<string, number>());
    }
    const wardCandidates = byWard.get(row.ward);
    if (!wardCandidates) {
      continue;
    }
    const candidateName = normalizeCandidateName(row.candidate);
    wardCandidates.set(candidateName, (wardCandidates.get(candidateName) || 0) + row.votes);
  }

  return buildWardBreakdownRows(byWard);
}

function buildWardBreakdown(raceResults: ResultRow[]): WardBreakdownRow[] {
  const wardBreakdownFromColumns = buildWardBreakdownFromColumns(raceResults);
  if (wardBreakdownFromColumns.length > 0) {
    return wardBreakdownFromColumns;
  }

  return buildWardBreakdownFromWardRows(raceResults);
}

function buildRace(
  config: RaceConfigRow,
  raceResults: ResultRow[],
  electionStatus: ElectionStatus,
): NormalizedRace {
  const candidates = buildCandidates(raceResults, config.seats, config.race_type, electionStatus);
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  return {
    election: config.election,
    race: config.race,
    raceType: config.race_type,
    raceGroup: config.race_group,
    scope: config.scope,
    ward: config.ward,
    seats: config.seats,
    sortOrder: config.sort_order,
    showInKeyRaces: config.show_in_key_races,
    totalVotes,
    candidates,
    wardBreakdown: buildWardBreakdown(raceResults),
  };
}

function citySummaryTurnout(turnoutRows: TurnoutRow[]): { ballots: number; registered: number } {
  const cityRows = turnoutRows.filter((row) => row.election === 'CITY');
  const wardRows = cityRows.filter((row) => row.ward !== 'ALL');
  const useRows = wardRows.length > 0 ? wardRows : cityRows;

  return useRows.reduce(
    (acc, row) => {
      acc.ballots += row.ballots_counted;
      acc.registered += row.registered_voters;
      return acc;
    },
    { ballots: 0, registered: 0 },
  );
}

function buildReportingSummary(
  wardStatuses: WardStatusRow[],
  turnoutRows: TurnoutRow[],
): ReportingSummaryData {
  const uniqueWards = Array.from(new Set(wardStatuses.map((row) => row.ward))).filter((ward) => ward !== 'ALL');
  const totalWards = uniqueWards.length > 0 ? uniqueWards.length : 3;
  const reportedWards = wardStatuses.filter(
    (row) => row.ward !== 'ALL' && (row.status === 'REPORTED' || row.status === 'FINAL'),
  ).length;

  const turnout = citySummaryTurnout(turnoutRows);
  const turnoutPercentage = turnout.registered > 0 ? (turnout.ballots / turnout.registered) * 100 : 0;
  const percentReporting = totalWards > 0 ? (reportedWards / totalWards) * 100 : 0;

  return {
    reportedWards,
    totalWards,
    percentReporting,
    ballotsCounted: turnout.ballots,
    registeredVoters: turnout.registered,
    turnoutPercentage,
    isFinal: wardStatuses.length > 0 && wardStatuses.every((row) => row.status === 'FINAL'),
  };
}

function buildElectionSection(
  id: ElectionId,
  electionStatus: ElectionStatus,
  configs: RaceConfigRow[],
  groupedResults: Map<string, ResultRow[]>,
): ElectionSectionData {
  const races = configs
    .filter((config) => config.election === id && config.enabled)
    .map((config) => {
      const results = groupedResults.get(raceKey(config.election, config.race)) || [];
      return buildRace(config, results, electionStatus);
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id,
    title: id === 'CITY' ? appTheme.citySectionTitle : appTheme.schoolSectionTitle,
    status: electionStatus,
    keyRaces: races.filter((race) => race.showInKeyRaces),
    offices: races.filter((race) => race.raceType === 'office' && !race.showInKeyRaces),
    ballots: races.filter((race) => race.raceType === 'ballot'),
    races,
  };
}

export function normalizeDashboardData(args: {
  results: ResultRow[];
  wardStatuses: WardStatusRow[];
  electionStatuses: ElectionStatusRow[];
  turnout: TurnoutRow[];
  raceConfig: RaceConfigRow[];
}): DashboardData {
  const statusByElection = new Map<ElectionId, ElectionStatus>([
    ['CITY', 'PENDING'],
    ['SCHOOL', 'PENDING'],
  ]);

  for (const status of args.electionStatuses) {
    statusByElection.set(status.election, status.status);
  }

  const groupedResults = new Map<string, ResultRow[]>();
  for (const row of args.results) {
    const key = raceKey(row.election, row.race);
    if (!groupedResults.has(key)) {
      groupedResults.set(key, []);
    }
    const group = groupedResults.get(key);
    if (!group) {
      continue;
    }
    group.push(row);
  }

  const citySection = buildElectionSection(
    'CITY',
    statusByElection.get('CITY') || 'PENDING',
    args.raceConfig,
    groupedResults,
  );

  const schoolSection = buildElectionSection(
    'SCHOOL',
    statusByElection.get('SCHOOL') || 'PENDING',
    args.raceConfig,
    groupedResults,
  );

  const sortedWardStatuses = [...args.wardStatuses]
    .filter((row) => row.ward !== 'ALL')
    .sort((a, b) => Number.parseInt(a.ward, 10) - Number.parseInt(b.ward, 10));

  const summary = buildReportingSummary(sortedWardStatuses, args.turnout);

  const overallFinal =
    summary.isFinal &&
    (statusByElection.get('CITY') || 'PENDING') === 'FINAL' &&
    (statusByElection.get('SCHOOL') || 'PENDING') === 'FINAL';

  return {
    sections: {
      CITY: citySection,
      SCHOOL: schoolSection,
    },
    wardStatuses: sortedWardStatuses,
    summary,
    overallFinal,
  };
}

