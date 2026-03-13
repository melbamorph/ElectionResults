import { appTheme } from '../theme';
import { DashboardData } from '../types';

export const dashboardFixture: DashboardData = {
  sections: {
    CITY: {
      id: 'CITY',
      title: appTheme.citySectionTitle,
      status: 'REPORTED',
      keyRaces: [
        {
          election: 'CITY',
          race: 'City Councilor At Large',
          raceType: 'office',
          raceGroup: null,
          scope: 'CITYWIDE',
          ward: 'ALL',
          seats: 2,
          sortOrder: 1,
          showInKeyRaces: true,
          totalVotes: 900,
          candidates: [
            { candidate: 'Padme N. Amidala', votes: 340, percentage: 37.8, rank: 1, isLeader: true, isWinner: true },
            { candidate: 'Yoda M. Jedi', votes: 325, percentage: 36.1, rank: 2, isLeader: false, isWinner: true },
            { candidate: 'Chewbacca R. Wookiee', votes: 235, percentage: 26.1, rank: 3, isLeader: false, isWinner: false },
          ],
          wardBreakdown: [],
        },
      ],
      offices: [],
      ballots: [],
      races: [
        {
          election: 'CITY',
          race: 'City Councilor At Large',
          raceType: 'office',
          raceGroup: null,
          scope: 'CITYWIDE',
          ward: 'ALL',
          seats: 2,
          sortOrder: 1,
          showInKeyRaces: true,
          totalVotes: 900,
          candidates: [
            { candidate: 'Padme N. Amidala', votes: 340, percentage: 37.8, rank: 1, isLeader: true, isWinner: true },
            { candidate: 'Yoda M. Jedi', votes: 325, percentage: 36.1, rank: 2, isLeader: false, isWinner: true },
            { candidate: 'Chewbacca R. Wookiee', votes: 235, percentage: 26.1, rank: 3, isLeader: false, isWinner: false },
          ],
          wardBreakdown: [],
        },
      ],
    },
    SCHOOL: {
      id: 'SCHOOL',
      title: appTheme.schoolSectionTitle,
      status: 'PENDING',
      keyRaces: [],
      offices: [],
      ballots: [],
      races: [],
    },
  },
  wardStatuses: [
    { ward: '1', status: 'FINAL' },
    { ward: '2', status: 'REPORTED' },
    { ward: '3', status: 'COUNTING' },
  ],
  summary: {
    reportedWards: 2,
    totalWards: 3,
    percentReporting: 66.7,
    ballotsCounted: 2134,
    registeredVoters: 8420,
    turnoutByWard: [
      { ward: '1', ballotsCounted: 745, registeredVoters: 2700 },
      { ward: '2', ballotsCounted: 690, registeredVoters: 2600 },
      { ward: '3', ballotsCounted: 699, registeredVoters: 3120 },
    ],
    turnoutPercentage: 25.3,
    isFinal: false,
  },
  overallFinal: false,
};
