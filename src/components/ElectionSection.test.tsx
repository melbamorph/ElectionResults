import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { appTheme } from '../theme';
import { ElectionSectionData, NormalizedRace } from '../types';
import { ElectionSection } from './ElectionSection';
import { RaceCard } from './RaceCard';

function buildRace(overrides: Partial<NormalizedRace> & Pick<NormalizedRace, 'race'>): NormalizedRace {
  const { race, ...rest } = overrides;

  return {
    election: 'CITY',
    race,
    raceType: 'office',
    scope: 'CITYWIDE',
    ward: 'ALL',
    seats: 1,
    sortOrder: 1,
    showInKeyRaces: true,
    totalVotes: 0,
    candidates: [],
    wardBreakdown: [],
    ...rest,
  };
}

const citySection: ElectionSectionData = {
  id: 'CITY',
  title: appTheme.citySectionTitle,
  status: 'REPORTED',
  keyRaces: [
    {
      election: 'CITY',
      race: 'Ward Councilor Ward 1',
      raceType: 'office',
      scope: 'WARD',
      ward: '1',
      seats: 1,
      sortOrder: 1,
      showInKeyRaces: true,
      totalVotes: 215,
      candidates: [
        { candidate: 'Andrew Faunce', votes: 120, percentage: 55.8, rank: 1, isLeader: true, isWinner: true },
        { candidate: 'Jamie Stone', votes: 95, percentage: 44.2, rank: 2, isLeader: false, isWinner: false },
      ],
      wardBreakdown: [
        {
          ward: '1',
          totalVotes: 215,
          candidates: [
            { candidate: 'Andrew Faunce', votes: 120, percentage: 55.8 },
            { candidate: 'Jamie Stone', votes: 95, percentage: 44.2 },
          ],
        },
      ],
    },
  ],
  offices: [],
  ballots: [],
  races: [],
};

const schoolSection: ElectionSectionData = {
  id: 'SCHOOL',
  title: appTheme.schoolSectionTitle,
  status: 'PENDING',
  keyRaces: [],
  offices: [],
  ballots: [],
  races: [],
};

describe('ElectionSection', () => {
  it('shows ward status tracker for city section only', () => {
    const wards = [
      { ward: '1', status: 'PENDING' as const },
      { ward: '2', status: 'COUNTING' as const },
      { ward: '3', status: 'REPORTED' as const },
    ];

    const { rerender } = render(<ElectionSection section={citySection} wardStatuses={wards} />);
    expect(screen.getByText(/Ward Reporting Status/i)).toBeInTheDocument();

    rerender(<ElectionSection section={schoolSection} wardStatuses={wards} />);
    expect(screen.queryByText(/Ward Reporting Status/i)).not.toBeInTheDocument();
  });

  it('groups library trustees with councilors at large and hides duplicate all-offices block', () => {
    const ward = buildRace({ race: 'Ward Councilor Ward 1', scope: 'WARD', ward: '1', sortOrder: 1 });
    const atLarge = buildRace({ race: 'City Councilor At Large', sortOrder: 2, seats: 2 });
    const library = buildRace({
      race: 'Library Trustees',
      sortOrder: 3,
      seats: 3,
      showInKeyRaces: false,
    });
    const ballot = buildRace({
      race: 'Question Number One',
      raceType: 'ballot',
      sortOrder: 4,
      showInKeyRaces: false,
    });

    const section: ElectionSectionData = {
      id: 'CITY',
      title: appTheme.citySectionTitle,
      status: 'REPORTED',
      keyRaces: [ward, atLarge],
      offices: [library],
      ballots: [ballot],
      races: [ward, atLarge, library, ballot],
    };

    render(<ElectionSection section={section} wardStatuses={[]} />);

    const atLargeGroup = screen.getByRole('heading', {
      name: /Councilors At[- ]Large (?:&|and) Library Trustees/i,
    });
    expect(atLargeGroup).toBeInTheDocument();

    const groupContainer = atLargeGroup.closest('section');
    expect(groupContainer).not.toBeNull();
    if (groupContainer) {
      expect(within(groupContainer).getByText('City Councilor At Large')).toBeInTheDocument();
      expect(within(groupContainer).getByText('Library Trustees')).toBeInTheDocument();
    }

    expect(screen.queryByRole('heading', { name: /^All Offices$/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Ballot Questions$/i })).toBeInTheDocument();
  });
});

describe('RaceCard', () => {
  it('supports expandable ward breakdown on city races', () => {
    render(<RaceCard race={citySection.keyRaces[0]} electionStatus="REPORTED" />);

    const toggle = screen.getByRole('button', { name: /show ward breakdown/i });
    expect(toggle).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.getByText(/Total votes: 215/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /hide ward breakdown/i }));
    expect(screen.queryByText(/Total votes: 215/i)).not.toBeInTheDocument();
  });
});

