import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReportingSummary } from './ReportingSummary';

const summary = {
  reportedWards: 1,
  totalWards: 3,
  percentReporting: 33.3,
  ballotsCounted: 1200,
  registeredVoters: 4000,
  turnoutPercentage: 30,
  isFinal: false,
};

const wards = [
  { ward: '1', status: 'REPORTED' as const },
  { ward: '2', status: 'COUNTING' as const },
  { ward: '3', status: 'PENDING' as const },
];

describe('ReportingSummary', () => {
  it('renders ward cards with symbol icons and filter guidance text', () => {
    render(
      <ReportingSummary
        summary={summary}
        wards={wards}
        selectedWard={null}
        onSelectWard={vi.fn()}
        onResetWard={vi.fn()}
      />,
    );

    expect(screen.getByText(/click a ward card to filter municipal results by that ward/i)).toBeInTheDocument();

    const ward1 = screen.getByRole('button', { name: /show ward 1 ballot items/i });
    const ward2 = screen.getByRole('button', { name: /show ward 2 ballot items/i });
    const ward3 = screen.getByRole('button', { name: /show ward 3 ballot items/i });

    expect(ward1).toHaveTextContent('✓');
    expect(ward1).toHaveTextContent(/reported/i);
    expect(ward2).toHaveTextContent('⏳');
    expect(ward2).toHaveTextContent(/counting/i);
    expect(ward3).toHaveTextContent('○');
    expect(ward3).toHaveTextContent(/pending/i);

    expect(screen.getByRole('button', { name: /^reset$/i })).toBeDisabled();
  });

  it('handles card selection and reset interactions', async () => {
    const onSelectWard = vi.fn();
    const onResetWard = vi.fn();
    const user = userEvent.setup();

    render(
      <ReportingSummary
        summary={summary}
        wards={wards}
        selectedWard="2"
        onSelectWard={onSelectWard}
        onResetWard={onResetWard}
      />,
    );

    const ward2 = screen.getByRole('button', { name: /show ward 2 ballot items/i });
    expect(ward2).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: /show ward 1 ballot items/i }));
    expect(onSelectWard).toHaveBeenCalledWith('1');

    await user.click(screen.getByRole('button', { name: /^reset$/i }));
    expect(onResetWard).toHaveBeenCalledTimes(1);
  });
});
