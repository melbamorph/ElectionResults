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
    raceGroup: null,
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
      raceGroup: null,
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
  races: [
    {
      election: 'CITY',
      race: 'Ward Councilor Ward 1',
      raceType: 'office',
      raceGroup: null,
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
};

describe('ElectionSection', () => {
  it('renders two top-level containers with generic subgrouping', () => {
    const democraticGovernor = buildRace({
      race: 'Governor',
      raceGroup: 'Democratic Ballot',
      sortOrder: 1,
    });
    const republicanGovernor = buildRace({
      race: 'Governor (Republican)',
      raceGroup: 'Republican Ballot',
      sortOrder: 2,
    });
    const nonpartisanClerk = buildRace({
      race: 'Town Clerk',
      raceGroup: null,
      sortOrder: 3,
    });
    const constitutionalAmendment = buildRace({
      race: 'Constitutional Amendment 1',
      raceType: 'ballot',
      raceGroup: 'State Questions',
      sortOrder: 4,
      showInKeyRaces: false,
    });
    const localQuestion = buildRace({
      race: 'Local Question 2',
      raceType: 'ballot',
      raceGroup: null,
      sortOrder: 5,
      showInKeyRaces: false,
    });

    const section: ElectionSectionData = {
      id: 'CITY',
      title: appTheme.citySectionTitle,
      status: 'REPORTED',
      keyRaces: [democraticGovernor, republicanGovernor],
      offices: [nonpartisanClerk],
      ballots: [constitutionalAmendment, localQuestion],
      races: [democraticGovernor, republicanGovernor, nonpartisanClerk, constitutionalAmendment, localQuestion],
    };

    render(<ElectionSection section={section} />);

    const electedPositionsHeading = screen.getByRole('heading', { name: /^Elected Positions$/i });
    const ballotQuestionsHeading = screen.getByRole('heading', { name: /^Ballot Questions$/i });

    expect(electedPositionsHeading).toBeInTheDocument();
    expect(ballotQuestionsHeading).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /^Democratic Ballot$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Republican Ballot$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Other Positions$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^State Questions$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Other Questions$/i })).toBeInTheDocument();

    const electedContainer = electedPositionsHeading.closest('section');
    expect(electedContainer).not.toBeNull();
    if (electedContainer) {
      expect(within(electedContainer).getByText('Governor')).toBeInTheDocument();
      expect(within(electedContainer).getByText('Governor (Republican)')).toBeInTheDocument();
      expect(within(electedContainer).getByText('Town Clerk')).toBeInTheDocument();
    }

    const ballotContainer = ballotQuestionsHeading.closest('section');
    expect(ballotContainer).not.toBeNull();
    if (ballotContainer) {
      expect(within(ballotContainer).getByText('Constitutional Amendment 1')).toBeInTheDocument();
      expect(within(ballotContainer).getByText('Local Question 2')).toBeInTheDocument();
    }
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
