import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardFixture } from '../test/fixtures';
import { useElectionData } from './useElectionData';

const { loadDashboardDataMock } = vi.hoisted(() => ({
  loadDashboardDataMock: vi.fn(),
}));

vi.mock('../data/api', () => ({
  loadDashboardData: loadDashboardDataMock,
}));

describe('useElectionData', () => {
  beforeEach(() => {
    loadDashboardDataMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads immediately and schedules a 20-second refresh interval', async () => {
    loadDashboardDataMock.mockResolvedValue(dashboardFixture);
    const intervalSpy = vi.spyOn(window, 'setInterval');

    const { result } = renderHook(() => useElectionData());

    await waitFor(() => {
      expect(result.current.data).toEqual(dashboardFixture);
    });

    const refreshCall = intervalSpy.mock.calls.find((call) => call[1] === 20_000);
    expect(refreshCall).toBeDefined();
  });

  it('retains last good data if a refresh attempt fails', async () => {
    loadDashboardDataMock.mockResolvedValue(dashboardFixture);
    const intervalSpy = vi.spyOn(window, 'setInterval');

    const { result } = renderHook(() => useElectionData());

    await waitFor(() => {
      expect(result.current.data).toEqual(dashboardFixture);
    });

    loadDashboardDataMock.mockRejectedValueOnce(new Error('Network unavailable'));

    const refreshCall = intervalSpy.mock.calls.find((call) => call[1] === 20_000);
    expect(refreshCall).toBeDefined();

    const refreshFn = refreshCall?.[0];
    expect(typeof refreshFn).toBe('function');

    await act(async () => {
      (refreshFn as () => void)();
    });

    await waitFor(() => {
      expect(result.current.error).toContain('Network unavailable');
    });

    expect(result.current.data).toEqual(dashboardFixture);
  });
});
