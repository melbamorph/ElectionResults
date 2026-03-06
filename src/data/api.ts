import { CsvEndpoints, DashboardData } from '../types';
import {
  normalizeDashboardData,
  parseElectionStatusCsv,
  parseRaceConfigCsv,
  parseResultsCsv,
  parseTurnoutCsv,
  parseWardStatusCsv,
} from './transform';

function addCacheBuster(url: string): string {
  const divider = url.includes('?') ? '&' : '?';
  return `${url}${divider}t=${Date.now()}`;
}

async function fetchText(url: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(addCacheBuster(url), {
    signal,
    cache: 'no-store',
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }

  return response.text();
}

export async function loadDashboardData(
  endpoints: CsvEndpoints,
  signal: AbortSignal,
): Promise<DashboardData> {
  const [resultsText, wardStatusText, electionStatusText, turnoutText, raceConfigText] = await Promise.all([
    fetchText(endpoints.resultsUrl, signal),
    fetchText(endpoints.wardStatusUrl, signal),
    fetchText(endpoints.electionStatusUrl, signal),
    fetchText(endpoints.turnoutUrl, signal),
    fetchText(endpoints.raceConfigUrl, signal),
  ]);

  return normalizeDashboardData({
    results: parseResultsCsv(resultsText),
    wardStatuses: parseWardStatusCsv(wardStatusText),
    electionStatuses: parseElectionStatusCsv(electionStatusText),
    turnout: parseTurnoutCsv(turnoutText),
    raceConfig: parseRaceConfigCsv(raceConfigText),
  });
}
