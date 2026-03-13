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
  it('renders municipal ballot races in articles, ballot questions, and amendments containers', () => {
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
    const budgetArticle = buildRace({
      race: 'Article 2',
      raceType: 'ballot',
      raceGroup: 'Town Articles',
      sortOrder: 4,
      showInKeyRaces: false,
    });
    const constitutionalAmendment = buildRace({
      race: 'Constitutional Amendment 1',
      raceType: 'ballot',
      raceGroup: 'State Amendments',
      sortOrder: 5,
      showInKeyRaces: false,
    });
    const stateQuestion = buildRace({
      race: 'State Question 1',
      raceType: 'ballot',
      raceGroup: 'State Questions',
      sortOrder: 6,
      showInKeyRaces: false,
    });
    const localQuestion = buildRace({
      race: 'Local Question 2',
      raceType: 'ballot',
      raceGroup: null,
      sortOrder: 7,
      showInKeyRaces: false,
    });

    const section: ElectionSectionData = {
      id: 'CITY',
      title: appTheme.citySectionTitle,
      status: 'REPORTED',
      keyRaces: [democraticGovernor, republicanGovernor],
      offices: [nonpartisanClerk],
      ballots: [budgetArticle, constitutionalAmendment, stateQuestion, localQuestion],
      races: [
        democraticGovernor,
        republicanGovernor,
        nonpartisanClerk,
        budgetArticle,
        constitutionalAmendment,
        stateQuestion,
        localQuestion,
      ],
    };

    render(<ElectionSection section={section} />);

    expect(screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
      'Elected Positions',
      'Articles',
      'Ballot Questions',
      'Amendments',
    ]);

    expect(screen.queryByRole('heading', { name: /^Democratic Ballot$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Republican Ballot$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Other Positions$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Town Articles$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^State Amendments$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Other Questions$/i })).not.toBeInTheDocument();

    const electedContainer = screen.getByRole('heading', { name: /^Elected Positions$/i }).closest('section');
    expect(electedContainer).not.toBeNull();
    if (electedContainer) {
      expect(within(electedContainer).getByText('Governor')).toBeInTheDocument();
      expect(within(electedContainer).getByText('Governor (Republican)')).toBeInTheDocument();
      expect(within(electedContainer).getByText('Town Clerk')).toBeInTheDocument();
    }

    const articlesContainer = screen.getByRole('heading', { name: /^Articles$/i }).closest('section');
    expect(articlesContainer).not.toBeNull();
    if (articlesContainer) {
      expect(within(articlesContainer).getByText('Article 2')).toBeInTheDocument();
      expect(within(articlesContainer).queryByText('Local Question 2')).not.toBeInTheDocument();
      expect(within(articlesContainer).queryByText('Constitutional Amendment 1')).not.toBeInTheDocument();
    }

    const ballotContainer = screen.getByRole('heading', { name: /^Ballot Questions$/i }).closest('section');
    expect(ballotContainer).not.toBeNull();
    if (ballotContainer) {
      expect(within(ballotContainer).getByText('State Question 1')).toBeInTheDocument();
      expect(within(ballotContainer).getByText('Local Question 2')).toBeInTheDocument();
      expect(within(ballotContainer).queryByText('Article 2')).not.toBeInTheDocument();
      expect(within(ballotContainer).queryByText('Constitutional Amendment 1')).not.toBeInTheDocument();
    }

    const amendmentsContainer = screen.getByRole('heading', { name: /^Amendments$/i }).closest('section');
    expect(amendmentsContainer).not.toBeNull();
    if (amendmentsContainer) {
      expect(within(amendmentsContainer).getByText('Constitutional Amendment 1')).toBeInTheDocument();
      expect(within(amendmentsContainer).queryByText('Article 2')).not.toBeInTheDocument();
      expect(within(amendmentsContainer).queryByText('Local Question 2')).not.toBeInTheDocument();
    }
  });

  it('renames school ballot questions to articles', () => {
    const schoolBoard = buildRace({
      election: 'SCHOOL',
      race: 'School Board',
      raceGroup: 'School Offices',
      sortOrder: 1,
    });
    const schoolArticle = buildRace({
      election: 'SCHOOL',
      race: 'Article 1',
      raceType: 'ballot',
      raceGroup: 'School Warrant',
      sortOrder: 2,
      showInKeyRaces: false,
    });
    const schoolQuestion = buildRace({
      election: 'SCHOOL',
      race: 'Budget Question',
      raceType: 'ballot',
      raceGroup: null,
      sortOrder: 3,
      showInKeyRaces: false,
    });

    const section: ElectionSectionData = {
      id: 'SCHOOL',
      title: appTheme.schoolSectionTitle,
      status: 'REPORTED',
      keyRaces: [schoolBoard],
      offices: [],
      ballots: [schoolArticle, schoolQuestion],
      races: [schoolBoard, schoolArticle, schoolQuestion],
    };

    render(<ElectionSection section={section} />);

    expect(screen.getByRole('heading', { name: /^Articles$/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Ballot Questions$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Amendments$/i })).not.toBeInTheDocument();

    const articlesContainer = screen.getByRole('heading', { name: /^Articles$/i }).closest('section');
    expect(articlesContainer).not.toBeNull();
    if (articlesContainer) {
      expect(within(articlesContainer).getByText('Article 1')).toBeInTheDocument();
      expect(within(articlesContainer).getByText('Budget Question')).toBeInTheDocument();
    }
  });

  it('renders races in a single responsive list that preserves DOM order', () => {
    const firstRace = buildRace({
      race: 'Assessor',
      totalVotes: 140,
      sortOrder: 1,
      candidates: [
        { candidate: 'Alex North', votes: 80, percentage: 57.1, rank: 1, isLeader: true, isWinner: true },
        { candidate: 'Jamie South', votes: 60, percentage: 42.9, rank: 2, isLeader: false, isWinner: false },
      ],
    });
    const secondRace = buildRace({
      race: 'City Clerk',
      totalVotes: 210,
      sortOrder: 2,
      candidates: [
        { candidate: 'Taylor Reed', votes: 90, percentage: 42.9, rank: 1, isLeader: true, isWinner: true },
        { candidate: 'Jordan Dale', votes: 70, percentage: 33.3, rank: 2, isLeader: false, isWinner: false },
        { candidate: 'Morgan Lane', votes: 50, percentage: 23.8, rank: 3, isLeader: false, isWinner: false },
      ],
    });
    const thirdRace = buildRace({
      race: 'Treasurer',
      totalVotes: 90,
      sortOrder: 3,
      candidates: [{ candidate: 'Casey Hart', votes: 90, percentage: 100, rank: 1, isLeader: true, isWinner: true }],
    });

    render(
      <ElectionSection
        section={{
          id: 'CITY',
          title: appTheme.citySectionTitle,
          status: 'REPORTED',
          keyRaces: [firstRace, secondRace, thirdRace],
          offices: [],
          ballots: [],
          races: [firstRace, secondRace, thirdRace],
        }}
      />,
    );

    const raceList = screen.getByTestId('race-group-__default__-list');
    expect(raceList.className).toContain('md:divide-y');
    expect(raceList.className).not.toContain('sm:grid-cols-2');
    expect(raceList.className).not.toContain('xl:grid-cols-3');

    const renderedRaces = Array.from(raceList.querySelectorAll('article[data-layout="responsive-list"] h4')).map(
      (heading) => heading.textContent,
    );
    expect(renderedRaces).toEqual(['Assessor', 'City Clerk', 'Treasurer']);

    const responsiveCards = Array.from(raceList.querySelectorAll('article[data-layout="responsive-list"]'));
    expect(responsiveCards).toHaveLength(3);
    expect(responsiveCards[0]?.className).toContain('rounded-lg');
    expect(responsiveCards[0]?.className).toContain('md:grid');
    expect(responsiveCards[0]?.className).toContain('md:rounded-none');
  });
});

describe('RaceCard', () => {
  it('shows total votes beneath the race title', () => {
    render(<RaceCard race={citySection.keyRaces[0]} />);

    expect(screen.getByText(/Total votes: 215/i)).toBeInTheDocument();
  });

  it('shows candidate-level ward breakdown toggles for citywide races', () => {
    const allWardRace = buildRace({
      election: 'SCHOOL',
      race: 'School Board',
      scope: 'CITYWIDE',
      ward: 'ALL',
      totalVotes: 350,
      candidates: [
        { candidate: 'Andrew Faunce', votes: 200, percentage: 57.1, rank: 1, isLeader: true, isWinner: true },
        { candidate: 'Jamie Stone', votes: 150, percentage: 42.9, rank: 2, isLeader: false, isWinner: false },
      ],
      wardBreakdown: [
        {
          ward: '1',
          totalVotes: 180,
          candidates: [
            { candidate: 'Andrew Faunce', votes: 100, percentage: 55.6 },
            { candidate: 'Jamie Stone', votes: 80, percentage: 44.4 },
          ],
        },
        {
          ward: '2',
          totalVotes: 170,
          candidates: [
            { candidate: 'Andrew Faunce', votes: 100, percentage: 58.8 },
            { candidate: 'Jamie Stone', votes: 70, percentage: 41.2 },
          ],
        },
      ],
    });

    const { rerender } = render(<RaceCard race={allWardRace} />);

    expect(screen.getByRole('button', { name: /show ward breakdown for andrew faunce/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show ward breakdown for jamie stone/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /show ward breakdown for andrew faunce/i }));
    expect(screen.getByText('Ward 1')).toBeInTheDocument();
    expect(screen.getByText('Ward 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /hide ward breakdown for andrew faunce/i }));
    expect(screen.queryByText('Ward 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Ward 2')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^show ward breakdown$/i })).not.toBeInTheDocument();

    rerender(<RaceCard race={citySection.keyRaces[0]} />);
    expect(screen.queryByRole('button', { name: /show ward breakdown for andrew faunce/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^show ward breakdown$/i })).not.toBeInTheDocument();
  });

  it('keeps all candidates visible in responsive list mode', () => {
    const multiCandidateRace = buildRace({
      race: 'Library Trustee',
      totalVotes: 300,
      seats: 2,
      candidates: [
        { candidate: 'Sam Lee', votes: 120, percentage: 40, rank: 1, isLeader: true, isWinner: true },
        { candidate: 'Pat Morgan', votes: 100, percentage: 33.3, rank: 2, isLeader: false, isWinner: true },
        { candidate: 'Robin Vale', votes: 80, percentage: 26.7, rank: 3, isLeader: false, isWinner: false },
      ],
    });

    render(<RaceCard race={multiCandidateRace} compact layoutMode="responsive-list" />);

    expect(screen.getByText('Sam Lee')).toBeInTheDocument();
    expect(screen.getByText('Pat Morgan')).toBeInTheDocument();
    expect(screen.getByText('Robin Vale')).toBeInTheDocument();
    expect(screen.getByText(/Vote for 2/i)).toBeInTheDocument();

    const candidateRow = screen.getByText('Sam Lee').closest('div.rounded-md');
    expect(candidateRow?.className).toContain('md:grid-cols-[minmax(0,1.7fr)_minmax(150px,1fr)_9ch_6ch]');
  });
});
