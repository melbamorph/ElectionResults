import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ElectionSectionData } from '../types';
import { ElectionSection } from './ElectionSection';
import { RaceCard } from './RaceCard';

const citySection: ElectionSectionData = {
  id: 'CITY',
  title: 'City of Lebanon Municipal Election',
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
  title: 'Lebanon School District Election',
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
