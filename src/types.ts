export type ElectionId = 'CITY' | 'SCHOOL';

export type ElectionStatus = 'PENDING' | 'COUNTING' | 'REPORTED' | 'FINAL';

export type RaceType = 'office' | 'ballot';

export type RaceScope = 'WARD' | 'CITYWIDE';

export interface ResultRow {
  election: ElectionId;
  race: string;
  ward: string;
  candidate: string;
  votes: number;
}

export interface WardStatusRow {
  ward: string;
  status: ElectionStatus;
}

export interface ElectionStatusRow {
  election: ElectionId;
  status: ElectionStatus;
}

export interface TurnoutRow {
  election: ElectionId;
  ward: string;
  ballots_counted: number;
  registered_voters: number;
}

export interface RaceConfigRow {
  election: ElectionId;
  race: string;
  race_type: RaceType;
  scope: RaceScope;
  ward: string;
  seats: number;
  sort_order: number;
  show_in_key_races: boolean;
  enabled: boolean;
}

export interface CandidateResult {
  candidate: string;
  votes: number;
  percentage: number;
  rank: number;
  isLeader: boolean;
  isWinner: boolean;
}

export interface WardBreakdownCandidate {
  candidate: string;
  votes: number;
  percentage: number;
}

export interface WardBreakdownRow {
  ward: string;
  totalVotes: number;
  candidates: WardBreakdownCandidate[];
}

export interface NormalizedRace {
  election: ElectionId;
  race: string;
  raceType: RaceType;
  scope: RaceScope;
  ward: string;
  seats: number;
  sortOrder: number;
  showInKeyRaces: boolean;
  totalVotes: number;
  candidates: CandidateResult[];
  wardBreakdown: WardBreakdownRow[];
}

export interface ElectionSectionData {
  id: ElectionId;
  title: string;
  status: ElectionStatus;
  keyRaces: NormalizedRace[];
  offices: NormalizedRace[];
  ballots: NormalizedRace[];
  races: NormalizedRace[];
}

export interface ReportingSummaryData {
  reportedWards: number;
  totalWards: number;
  percentReporting: number;
  ballotsCounted: number;
  registeredVoters: number;
  turnoutPercentage: number;
  isFinal: boolean;
}

export interface DashboardData {
  sections: Record<ElectionId, ElectionSectionData>;
  wardStatuses: WardStatusRow[];
  summary: ReportingSummaryData;
  overallFinal: boolean;
}

export interface CsvEndpoints {
  resultsUrl: string;
  wardStatusUrl: string;
  electionStatusUrl: string;
  turnoutUrl: string;
  raceConfigUrl: string;
}
