import { describe, expect, it } from 'vitest';
import {
  normalizeDashboardData,
  parseElectionStatusCsv,
  parseRaceConfigCsv,
  parseResultsCsv,
  parseTurnoutCsv,
  parseWardStatusCsv,
} from './transform';

const resultsCsv = `election,race,ward,candidate,votes
CITY,City Councilor At Large,ALL,Paul Roberts,340
CITY,City Councilor At Large,ALL,Ronald Smith,325
CITY,City Councilor At Large,ALL,Kellen Appleton,280
CITY,Ward Councilor Ward 1,1,Andrew Faunce,120
CITY,Ward Councilor Ward 1,1,Jamie Stone,95
CITY,Ward Councilor Ward 2,2,Eric Cole,98
CITY,Ward Councilor Ward 2,2,George Sykes,110
SCHOOL,School Board,ALL,Candy Hammond,410
SCHOOL,School Board,ALL,Travis Talbert,398
SCHOOL,School Board,ALL,Tia Winter,372
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

const raceConfigCsv = `election,race,race_type,scope,ward,seats,sort_order,show_in_key_races,enabled
CITY,City Councilor At Large,office,CITYWIDE,ALL,2,1,TRUE,TRUE
CITY,Ward Councilor Ward 1,office,WARD,1,1,2,TRUE,TRUE
CITY,Ward Councilor Ward 2,office,WARD,2,1,3,FALSE,TRUE
SCHOOL,School Board,office,CITYWIDE,ALL,3,1,TRUE,TRUE
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

  it('computes winners, turnout, and ward reporting metrics', () => {
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
    expect(atLarge?.candidates.filter((c) => c.isWinner).map((c) => c.candidate)).toEqual([
      'Paul Roberts',
      'Ronald Smith',
    ]);

    const schoolBoard = data.sections.SCHOOL.races.find((race) => race.race === 'School Board');
    expect(schoolBoard?.candidates.every((c) => !c.isWinner)).toBe(true);

    const wardRace = data.sections.CITY.races.find((race) => race.race === 'Ward Councilor Ward 1');
    expect(wardRace?.wardBreakdown.length).toBe(1);

    expect(data.overallFinal).toBe(false);
  });
});
