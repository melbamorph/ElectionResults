import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { DashboardData, ElectionSectionData, NormalizedRace } from './types';

const { useElectionDataMock } = vi.hoisted(() => ({
  useElectionDataMock: vi.fn(),
}));

vi.mock('./hooks/useElectionData', () => ({
  useElectionData: useElectionDataMock,
}));

function buildRace(overrides: Partial<NormalizedRace> & Pick<NormalizedRace, 'race'>): NormalizedRace {
  const { race, ...rest } = overrides;

  return {
    election: 'CITY',
    race,
    raceType: 'office',
    raceGroup: null,
    scope: 'CITYWIDE',
    ward: 'ALL',
    seats: 1,
    sortOrder: 1,
    showInKeyRaces: false,
    totalVotes: 100,
    candidates: [],
    wardBreakdown: [],
    ...rest,
  };
}

function buildSection(id: 'CITY' | 'SCHOOL', title: string, races: NormalizedRace[]): ElectionSectionData {
  return {
    id,
    title,
    status: 'REPORTED',
    races,
    keyRaces: races.filter((race) => race.showInKeyRaces),
    offices: races.filter((race) => race.raceType === 'office' && !race.showInKeyRaces),
    ballots: races.filter((race) => race.raceType === 'ballot'),
  };
}

function buildData(): DashboardData {
  const cityRaces = [
    buildRace({
      race: 'Ward Councilor Ward 1',
      scope: 'WARD',
      ward: '1',
      showInKeyRaces: true,
      sortOrder: 1,
    }),
    buildRace({
      race: 'Ward Councilor Ward 2',
      scope: 'WARD',
      ward: '2',
      showInKeyRaces: true,
      sortOrder: 2,
    }),
    buildRace({
      race: 'City Councilor At Large',
      scope: 'CITYWIDE',
      ward: 'ALL',
      sortOrder: 3,
    }),
    buildRace({
      race: 'Question #1',
      raceType: 'ballot',
      scope: 'CITYWIDE',
      ward: 'ALL',
      sortOrder: 4,
    }),
  ];

  const schoolRaces = [
    buildRace({
      election: 'SCHOOL',
      race: 'School Board',
      scope: 'CITYWIDE',
      ward: 'ALL',
      sortOrder: 1,
    }),
    buildRace({
      election: 'SCHOOL',
      race: 'School Ward Reference Race',
      scope: 'WARD',
      ward: '2',
      sortOrder: 2,
    }),
  ];

  return {
    sections: {
      CITY: buildSection('CITY', 'City Election', cityRaces),
      SCHOOL: buildSection('SCHOOL', 'School Election', schoolRaces),
    },
    wardStatuses: [
      { ward: '1', status: 'REPORTED' },
      { ward: '2', status: 'COUNTING' },
      { ward: '3', status: 'PENDING' },
    ],
    summary: {
      reportedWards: 1,
      totalWards: 3,
      percentReporting: 33.3,
      ballotsCounted: 1000,
      registeredVoters: 5000,
      turnoutByWard: [
        { ward: '1', ballotsCounted: 300, registeredVoters: 1500 },
        { ward: '2', ballotsCounted: 350, registeredVoters: 1600 },
        { ward: '3', ballotsCounted: 350, registeredVoters: 1900 },
      ],
      turnoutPercentage: 20,
      isFinal: false,
    },
    overallFinal: false,
  };
}

describe('App ward filtering', () => {
  beforeEach(() => {
    useElectionDataMock.mockReset();
    useElectionDataMock.mockReturnValue({
      data: buildData(),
      isLoading: false,
      error: null,
      lastUpdated: new Date('2026-03-07T08:00:00.000Z'),
    });
    window.location.hash = '#/municipal-results';
  });

  afterEach(() => {
    window.location.hash = '';
  });

  it('filters municipal races to citywide + selected ward and resets to all', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('Ward Councilor Ward 1')).toBeInTheDocument();
    expect(screen.getByText('Ward Councilor Ward 2')).toBeInTheDocument();
    expect(screen.getByText('City Councilor At Large')).toBeInTheDocument();
    expect(screen.getByText('Question #1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^clear ward filter$/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /show ward 1 ballot items/i }));

    expect(screen.getByText('Ward Councilor Ward 1')).toBeInTheDocument();
    expect(screen.queryByText('Ward Councilor Ward 2')).not.toBeInTheDocument();
    expect(screen.getByText('City Councilor At Large')).toBeInTheDocument();
    expect(screen.getByText('Question #1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^clear ward filter$/i })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /^clear ward filter$/i }));

    expect(screen.getByText('Ward Councilor Ward 2')).toBeInTheDocument();
  });

  it('does not apply ward filtering to school results', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/school-results';

    render(<App />);

    expect(screen.getByText('School Board')).toBeInTheDocument();
    expect(screen.getByText('School Ward Reference Race')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /show ward 1 ballot items/i }));

    expect(screen.getByText('School Board')).toBeInTheDocument();
    expect(screen.getByText('School Ward Reference Race')).toBeInTheDocument();
  });
});





