import { CsvEndpoints } from './types';

const DEFAULT_ALLOWED_CSV_HOSTS = ['docs.google.com', 'docs.googleusercontent.com'];

interface EndpointValidationOptions {
  allowAnyHost: boolean;
  allowedHosts: string[];
}

export function parseAllowedCsvHosts(rawValue?: string): string[] {
  const parsed = (rawValue || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : DEFAULT_ALLOWED_CSV_HOSTS;
}

function isRelativePath(url: string): boolean {
  return url.startsWith('/');
}

function isAllowedHost(hostname: string, allowedHosts: string[]): boolean {
  const normalizedHost = hostname.toLowerCase();
  return allowedHosts.some(
    (allowedHost) => normalizedHost === allowedHost || normalizedHost.endsWith(`.${allowedHost}`),
  );
}

export function validateCsvEndpoint(
  rawUrl: string,
  endpointName: string,
  options: EndpointValidationOptions,
): string {
  const url = rawUrl.trim();
  if (!url) {
    throw new Error(`Missing URL for ${endpointName}.`);
  }

  if (isRelativePath(url)) {
    return url;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL format for ${endpointName}: ${url}`);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(`Only HTTPS endpoints are allowed for ${endpointName}: ${url}`);
  }

  if (!options.allowAnyHost && !isAllowedHost(parsed.hostname, options.allowedHosts)) {
    throw new Error(
      `Host ${parsed.hostname} is not allowed for ${endpointName}. Allowed hosts: ${options.allowedHosts.join(', ')}`,
    );
  }

  if (parsed.hostname.endsWith('google.com')) {
    const outputFormat = parsed.searchParams.get('output');
    if (outputFormat && outputFormat.toLowerCase() !== 'csv') {
      throw new Error(`Google Sheets endpoint must use output=csv for ${endpointName}.`);
    }
  }

  return parsed.toString();
}

function envFlag(value: string | undefined): boolean {
  return (value || '').trim().toLowerCase() === 'true';
}

const allowedCsvHosts = parseAllowedCsvHosts(import.meta.env.VITE_ALLOWED_CSV_HOSTS);
const allowAnyCsvHost = envFlag(import.meta.env.VITE_ALLOW_ANY_CSV_HOST);

const validationOptions: EndpointValidationOptions = {
  allowAnyHost: allowAnyCsvHost,
  allowedHosts: allowedCsvHosts,
};

const resolveEndpoint = (value: string | undefined, fallback: string, name: string): string =>
  validateCsvEndpoint(value || fallback, name, validationOptions);

export const csvEndpoints: CsvEndpoints = {
  resultsUrl: resolveEndpoint(import.meta.env.VITE_RESULTS_CSV_URL, '/mock/results.csv', 'VITE_RESULTS_CSV_URL'),
  wardStatusUrl: resolveEndpoint(
    import.meta.env.VITE_WARD_STATUS_CSV_URL,
    '/mock/ward_status.csv',
    'VITE_WARD_STATUS_CSV_URL',
  ),
  electionStatusUrl: resolveEndpoint(
    import.meta.env.VITE_ELECTION_STATUS_CSV_URL,
    '/mock/election_status.csv',
    'VITE_ELECTION_STATUS_CSV_URL',
  ),
  turnoutUrl: resolveEndpoint(import.meta.env.VITE_TURNOUT_CSV_URL, '/mock/turnout.csv', 'VITE_TURNOUT_CSV_URL'),
  raceConfigUrl: resolveEndpoint(
    import.meta.env.VITE_RACE_CONFIG_CSV_URL,
    '/mock/race_config.csv',
    'VITE_RACE_CONFIG_CSV_URL',
  ),
};

export const refreshIntervalMs = 20_000;
