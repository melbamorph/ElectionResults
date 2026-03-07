import { describe, expect, it } from 'vitest';
import {
  normalizeDashboardData,
  parseElectionStatusCsv,
  parseRaceConfigCsv,
  parseResultsCsv,
  parseTurnoutCsv,
  parseWardStatusCsv,
} from './transform';

const resultsCsv = `election,race,ward,candidate,votes,ward_1,ward_2,ward_3
CITY,City Councilor At Large,ALL,Paul Roberts,340,110,120,110
CITY,City Councilor At Large,ALL,Ronald Smith,325,105,110,110
CITY,City Councilor At Large,ALL,Kellen Appleton,280,90,95,95
CITY,Ward Councilor Ward 1,1,Andrew Faunce,120,,,
CITY,Ward Councilor Ward 1,1,Jamie Stone,95,,,
CITY,Ward Councilor Ward 2,2,Eric Cole,98,,,
CITY,Ward Councilor Ward 2,2,George Sykes,110,,,
SCHOOL,School Board,ALL,Candy Hammond,410,,,
SCHOOL,School Board,ALL,Travis Talbert,398,,,
SCHOOL,School Board,ALL,Tia Winter,372,,,
`;

const wardStatusCsv = `ward,status
1,FINAL
2,REPORTED
3,PENDING
`;

const electionStatusCsv = `election,status
CITY,REPORTED
SCHOOL,PENDING
`;

const turnoutCsv = `election,ward,ballots_counted,registered_voters
CITY,1,745,2700
CITY,2,690,2600
CITY,3,699,3120
CITY,ALL,2134,8420
SCHOOL,ALL,2200,8600
`;

const raceConfigCsv = `election,race,race_type,race_group,scope,ward,seats,sort_order,show_in_key_races,enabled
CITY,City Councilor At Large,office,Citywide Ballot,CITYWIDE,ALL,2,1,TRUE,TRUE
CITY,Ward Councilor Ward 1,office,Ward Ballot A,WARD,1,1,2,TRUE,TRUE
CITY,Ward Councilor Ward 2,office,Ward Ballot B,WARD,2,1,3,FALSE,TRUE
SCHOOL,School Board,office,,CITYWIDE,ALL,3,1,TRUE,TRUE
`;

describe('CSV parsing and normalization', () => {
  it('throws on missing required headers', () => {
    const invalid = `election,race,ward,candidate\nCITY,Race,ALL,Name`;
    expect(() => parseResultsCsv(invalid)).toThrow(/missing required headers/i);
  });

  it('accepts CSV with preamble rows before the header', () => {
    const withPreamble = `Generated at,2026-01-01
Notes,Unofficial
election,race,ward,candidate,votes
CITY,Race,ALL,Name,10`;
    const parsed = parseResultsCsv(withPreamble);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({ election: 'CITY', race: 'Race', ward: 'ALL', candidate: 'Name', votes: 10 });
  });

  it('computes winners, turnout, ward reporting metrics, race groups, and write-ins default rows', () => {
    const data = normalizeDashboardData({
      results: parseResultsCsv(resultsCsv),
      wardStatuses: parseWardStatusCsv(wardStatusCsv),
      electionStatuses: parseElectionStatusCsv(electionStatusCsv),
      turnout: parseTurnoutCsv(turnoutCsv),
      raceConfig: parseRaceConfigCsv(raceConfigCsv),
    });

    expect(data.summary.ballotsCounted).toBe(2134);
    expect(data.summary.registeredVoters).toBe(8420);
    expect(data.summary.reportedWards).toBe(2);
    expect(data.summary.totalWards).toBe(3);

    const atLarge = data.sections.CITY.races.find((race) => race.race === 'City Councilor At Large');
    expect(atLarge).toBeDefined();
    expect(atLarge?.raceGroup).toBe('Citywide Ballot');
    expect(atLarge?.candidates.filter((c) => c.isWinner).map((c) => c.candidate)).toEqual([
      'Paul Roberts',
      'Ronald Smith',
    ]);
    expect(atLarge?.candidates.find((c) => c.candidate === 'Write-Ins')).toMatchObject({ votes: 0, isWinner: false });
    expect(atLarge?.wardBreakdown.map((row) => row.ward)).toEqual(['1', '2', '3']);
    expect(atLarge?.wardBreakdown.find((row) => row.ward === '2')?.totalVotes).toBe(325);
    expect(
      atLarge?.wardBreakdown
        .find((row) => row.ward === '2')
        ?.candidates.find((candidate) => candidate.candidate === 'Paul Roberts')
        ?.votes,
    ).toBe(120);

    const schoolBoard = data.sections.SCHOOL.races.find((race) => race.race === 'School Board');
    expect(schoolBoard?.raceGroup).toBeNull();
    expect(schoolBoard?.candidates.every((c) => !c.isWinner)).toBe(true);
    expect(schoolBoard?.candidates.find((c) => c.candidate === 'Write-Ins')).toMatchObject({ votes: 0, isWinner: false });

    const wardRace = data.sections.CITY.races.find((race) => race.race === 'Ward Councilor Ward 1');
    expect(wardRace?.raceGroup).toBe('Ward Ballot A');
    expect(wardRace?.wardBreakdown.length).toBe(1);

    expect(data.overallFinal).toBe(false);
  });

  it('shows write-in winner names only when a write-in candidate wins an office race', () => {
    const writeInResultsCsv = `election,race,ward,candidate,votes,write_in_winner_name
CITY,Town Clerk,ALL,Write In,125,Jordan Lee
CITY,Town Clerk,ALL,Pat Gomez,100,
CITY,Budget Question,ALL,Yes,210,
CITY,Budget Question,ALL,No,180,
CITY,Budget Question,ALL,Write-Ins,3,
`;

    const writeInRaceConfigCsv = `election,race,race_type,race_group,scope,ward,seats,sort_order,show_in_key_races,enabled
CITY,Town Clerk,office,,CITYWIDE,ALL,1,1,TRUE,TRUE
CITY,Budget Question,ballot,,CITYWIDE,ALL,1,2,FALSE,TRUE
`;

    const data = normalizeDashboardData({
      results: parseResultsCsv(writeInResultsCsv),
      wardStatuses: parseWardStatusCsv(wardStatusCsv),
      electionStatuses: parseElectionStatusCsv('election,status\nCITY,FINAL\nSCHOOL,PENDING\n'),
      turnout: parseTurnoutCsv(turnoutCsv),
      raceConfig: parseRaceConfigCsv(writeInRaceConfigCsv),
    });

    const townClerk = data.sections.CITY.races.find((race) => race.race === 'Town Clerk');
    expect(townClerk?.candidates[0]).toMatchObject({ candidate: 'Write-Ins (Jordan Lee)', votes: 125, isWinner: true });

    const budgetQuestion = data.sections.CITY.races.find((race) => race.race === 'Budget Question');
    expect(budgetQuestion?.candidates.find((c) => c.candidate === 'Write-Ins')).toMatchObject({ votes: 3 });
    expect(budgetQuestion?.candidates.some((c) => c.candidate.includes('(Jordan Lee)'))).toBe(false);
  });
});

