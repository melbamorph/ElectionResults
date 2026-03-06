import { ElectionSectionData, WardStatusRow } from '../types';
import { titleCase } from '../utils/format';
import { RaceCard } from './RaceCard';
import { statusChipClass } from './statusStyles';
import { WardStatusTracker } from './WardStatusTracker';

interface ElectionSectionProps {
  section: ElectionSectionData;
  wardStatuses?: WardStatusRow[];
}

export function ElectionSection({ section, wardStatuses = [] }: ElectionSectionProps) {
  return (
    <section className="space-y-5 rounded-2xl border border-line bg-white/70 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-ink">{section.title}</h2>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusChipClass(
            section.status,
          )}`}
        >
          {titleCase(section.status)}
        </span>
      </header>

      {section.id === 'CITY' && wardStatuses.length > 0 && <WardStatusTracker wards={wardStatuses} />}

      {section.keyRaces.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-ink">Key Races</h3>
          <div className="grid gap-4"> 
            {section.keyRaces.map((race) => (
              <RaceCard key={`${section.id}-key-${race.race}`} race={race} electionStatus={section.status} />
            ))}
          </div>
        </div>
      )}

      {section.offices.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-ink">All Offices</h3>
          <div className="grid gap-4">
            {section.offices.map((race) => (
              <RaceCard key={`${section.id}-office-${race.race}`} race={race} electionStatus={section.status} />
            ))}
          </div>
        </div>
      )}

      {section.ballots.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-ink">
            {section.id === 'CITY' ? 'Ballot Questions' : 'School Warrant Articles'}
          </h3>
          <div className="grid gap-4">
            {section.ballots.map((race) => (
              <RaceCard key={`${section.id}-ballot-${race.race}`} race={race} electionStatus={section.status} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
