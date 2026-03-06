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
          scope: 'CITYWIDE',
          ward: 'ALL',
          seats: 2,
          sortOrder: 1,
          showInKeyRaces: true,
          totalVotes: 900,
          candidates: [
            { candidate: 'Paul Roberts', votes: 340, percentage: 37.8, rank: 1, isLeader: true, isWinner: true },
            { candidate: 'Ronald Smith', votes: 325, percentage: 36.1, rank: 2, isLeader: false, isWinner: true },
            { candidate: 'Kellen Appleton', votes: 235, percentage: 26.1, rank: 3, isLeader: false, isWinner: false },
          ],
          wardBreakdown: [],
        },
      ],
      offices: [],
      ballots: [],
      races: [],
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
    turnoutPercentage: 25.3,
    isFinal: false,
  },
  overallFinal: false,
};
