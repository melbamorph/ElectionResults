import { ElectionSectionData, NormalizedRace, WardStatusRow } from '../types';
import { titleCase } from '../utils/format';
import { RaceCard } from './RaceCard';
import { statusChipClass } from './statusStyles';
import { WardStatusTracker } from './WardStatusTracker';

interface ElectionSectionProps {
  section: ElectionSectionData;
  wardStatuses?: WardStatusRow[];
}

interface CompactRaceGroupProps {
  title: string;
  subtitle: string;
  races: NormalizedRace[];
  electionStatus: ElectionSectionData['status'];
  panelClassName: string;
  accentClassName: string;
}

function isCouncilorRace(race: NormalizedRace): boolean {
  return race.raceType === 'office' && /council|counsel/i.test(race.race);
}

function isLibraryTrusteeRace(race: NormalizedRace): boolean {
  return race.raceType === 'office' && /library/i.test(race.race) && /trustee/i.test(race.race);
}

function CompactRaceGroup({
  title,
  subtitle,
  races,
  electionStatus,
  panelClassName,
  accentClassName,
}: CompactRaceGroupProps) {
  if (races.length === 0) {
    return null;
  }

  return (
    <section className={`space-y-3 rounded-xl border p-4 ${panelClassName}`}>
      <header className="flex items-center justify-between gap-3">
        <div>
          <h4 className="font-display text-base font-semibold text-ink">{title}</h4>
          <p className="text-xs text-slate">{subtitle}</p>
        </div>
        <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate">
          {races.length} race{races.length === 1 ? '' : 's'}
        </span>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {races.map((race) => (
          <RaceCard
            key={`${race.election}-${race.race}`}
            race={race}
            electionStatus={electionStatus}
            compact
            accentClassName={accentClassName}
          />
        ))}
      </div>
    </section>
  );
}

export function ElectionSection({ section, wardStatuses = [] }: ElectionSectionProps) {
  const isCity = section.id === 'CITY';

  const wardCouncilRaces = isCity
    ? section.keyRaces.filter((race) => race.scope === 'WARD' && isCouncilorRace(race))
    : [];
  const atLargeCouncilRaces = isCity
    ? section.keyRaces.filter(
        (race) => race.scope === 'CITYWIDE' && isCouncilorRace(race) && /at\s*large/i.test(race.race),
      )
    : [];
  const libraryTrusteeRaces = isCity ? section.races.filter((race) => isLibraryTrusteeRace(race)) : [];

  const atLargeAndLibraryRaces = [...atLargeCouncilRaces];
  for (const race of libraryTrusteeRaces) {
    if (!atLargeAndLibraryRaces.some((groupedRace) => groupedRace.race === race.race)) {
      atLargeAndLibraryRaces.push(race);
    }
  }
  atLargeAndLibraryRaces.sort((a, b) => a.sortOrder - b.sortOrder);

  const groupedRaceNames = new Set([...wardCouncilRaces, ...atLargeAndLibraryRaces].map((race) => race.race));
  const otherKeyRaces = section.keyRaces.filter((race) => !groupedRaceNames.has(race.race));
  const visibleOffices = isCity
    ? section.offices.filter((race) => !libraryTrusteeRaces.some((libraryRace) => libraryRace.race === race.race))
    : section.offices;

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

      {isCity && wardStatuses.length > 0 && <WardStatusTracker wards={wardStatuses} />}

      {section.keyRaces.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-ink">Election Results</h3>

          {isCity && (wardCouncilRaces.length > 0 || atLargeAndLibraryRaces.length > 0) ? (
            <div className="space-y-3">
              <CompactRaceGroup
                title="Ward Councilors"
                subtitle="Compact ward-by-ward city council races"
                races={wardCouncilRaces}
                electionStatus={section.status}
                panelClassName="border-sage/30 bg-sage/10"
                accentClassName="bg-sage"
              />
              <CompactRaceGroup
                title={libraryTrusteeRaces.length > 0 ? 'Councilors At-Large and Library Trustees' : 'Councilors At Large'}
                subtitle={
                  libraryTrusteeRaces.length > 0
                    ? 'Citywide council seats and library trustees in one compact group'
                    : 'Citywide seats shown in one compact group'
                }
                races={atLargeAndLibraryRaces}
                electionStatus={section.status}
                panelClassName="border-clay/30 bg-clay/10"
                accentClassName="bg-clay"
              />
              {otherKeyRaces.length > 0 && (
                <CompactRaceGroup
                  title="Other Key Races"
                  subtitle="Additional highlighted contests"
                  races={otherKeyRaces}
                  electionStatus={section.status}
                  panelClassName="border-smoke/25 bg-mist"
                  accentClassName="bg-smoke"
                />
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {section.keyRaces.map((race) => (
                <RaceCard key={`${section.id}-key-${race.race}`} race={race} electionStatus={section.status} />
              ))}
            </div>
          )}
        </div>
      )}

      {visibleOffices.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-ink">All Offices</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {visibleOffices.map((race) => (
              <RaceCard
                key={`${section.id}-office-${race.race}`}
                race={race}
                electionStatus={section.status}
                compact={isCity}
                accentClassName={isCity ? 'bg-smoke' : 'bg-smoke/40'}
              />
            ))}
          </div>
        </div>
      )}

      {section.ballots.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-ink">
            {isCity ? 'Ballot Questions' : 'School Warrant Articles'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {section.ballots.map((race) => (
              <RaceCard
                key={`${section.id}-ballot-${race.race}`}
                race={race}
                electionStatus={section.status}
                compact={isCity}
                accentClassName={isCity ? 'bg-smoke' : 'bg-smoke/40'}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}


