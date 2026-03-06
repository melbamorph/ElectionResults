import { describe, expect, it } from 'vitest';

import { parseCsvObjects } from './csv';

describe('parseCsvObjects', () => {
  it('parses headers with UTF-8 BOM', () => {
    const csv = '\uFEFFelection,race,ward,candidate,votes\nCITY,Mayor,ALL,Alex,100';

    const rows = parseCsvObjects(csv, ['election', 'race', 'ward', 'candidate', 'votes']);

    expect(rows).toEqual([
      {
        election: 'CITY',
        race: 'Mayor',
        ward: 'ALL',
        candidate: 'Alex',
        votes: '100',
      },
    ]);
  });

  it('parses headers case-insensitively', () => {
    const csv = 'Election,Race,Ward,Candidate,Votes\nCITY,Mayor,ALL,Alex,100';

    const rows = parseCsvObjects(csv, ['election', 'race', 'ward', 'candidate', 'votes']);

    expect(rows[0]).toMatchObject({
      election: 'CITY',
      race: 'Mayor',
      ward: 'ALL',
      candidate: 'Alex',
      votes: '100',
    });
  });


  it('parses semicolon-delimited CSV exports', () => {
    const csv = `election;race;ward;candidate;votes\nCITY;Mayor;ALL;Alex;100`;

    const rows = parseCsvObjects(csv, ['election', 'race', 'ward', 'candidate', 'votes']);

    expect(rows[0]).toMatchObject({
      election: 'CITY',
      race: 'Mayor',
      ward: 'ALL',
      candidate: 'Alex',
      votes: '100',
    });
  });
});
