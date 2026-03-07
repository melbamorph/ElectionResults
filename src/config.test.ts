import { describe, expect, it } from 'vitest';
import { parseAllowedCsvHosts, validateCsvEndpoint } from './config';

describe('config security validation', () => {
  const strictOptions = {
    allowAnyHost: false,
    allowedHosts: ['docs.google.com'],
  };
  const allowAnyHostOptions = {
    allowAnyHost: true,
    allowedHosts: [],
  };

  it('accepts relative mock endpoints', () => {
    expect(validateCsvEndpoint('/mock/results.csv', 'results', strictOptions)).toBe('/mock/results.csv');
  });

  it('accepts allowed https hosts', () => {
    const url = 'https://docs.google.com/spreadsheets/d/e/example/pubhtml?output=csv';
    expect(validateCsvEndpoint(url, 'results', strictOptions)).toContain('docs.google.com');
  });

  it('rejects non-https urls', () => {
    expect(() =>
      validateCsvEndpoint('http://docs.google.com/spreadsheets/d/e/example/pubhtml?output=csv', 'results', strictOptions),
    ).toThrow(/https/i);
  });

  it('rejects hosts outside allowlist', () => {
    expect(() =>
      validateCsvEndpoint('https://evil.example.com/results.csv', 'results', strictOptions),
    ).toThrow(/not allowed/i);
  });

  it('does not treat deceptive google-like domains as google hosts', () => {
    expect(
      validateCsvEndpoint(
        'https://evilgoogle.com/results.csv?output=html',
        'results',
        allowAnyHostOptions,
      ),
    ).toContain('evilgoogle.com');
  });

  it('rejects non-csv output for google hosts', () => {
    expect(() =>
      validateCsvEndpoint(
        'https://docs.google.com/spreadsheets/d/e/example/pubhtml?output=html',
        'results',
        allowAnyHostOptions,
      ),
    ).toThrow(/output=csv/i);
  });

  it('parses custom allowed host list', () => {
    expect(parseAllowedCsvHosts('example.com, data.example.org')).toEqual(['example.com', 'data.example.org']);
  });
});
