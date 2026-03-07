import { ElectionSectionData, ElectionStatus, NormalizedRace } from '../types';
import { titleCase } from '../utils/format';
import { RaceCard } from './RaceCard';
import { statusChipClass } from './statusStyles';

interface ElectionSectionProps {
  section: ElectionSectionData;
}

interface RaceTypeContainerProps {
  title: string;
  subtitle: string;
  races: NormalizedRace[];
  electionStatus: ElectionStatus;
  accentClassName: string;
  fallbackGroupTitle: string;
  emptyMessage: string;
}

interface RaceGroup {
  key: string;
  title: string | null;
  races: NormalizedRace[];
}

function toRaceGroupKey(groupTitle: string | null): string {
  return groupTitle ? groupTitle.toLowerCase() : '__default__';
}

function buildRaceGroups(races: NormalizedRace[]): RaceGroup[] {
  const grouped = new Map<string, RaceGroup>();

  for (const race of races) {
    const groupTitle = typeof race.raceGroup === 'string' && race.raceGroup.trim().length > 0 ? race.raceGroup.trim() : null;
    const key = toRaceGroupKey(groupTitle);

    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        title: groupTitle,
        races: [],
      });
    }

    const targetGroup = grouped.get(key);
    if (!targetGroup) {
      continue;
    }

    targetGroup.races.push(race);
  }

  return Array.from(grouped.values());
}

function RaceTypeContainer({
  title,
  subtitle,
  races,
  electionStatus,
  accentClassName,
  fallbackGroupTitle,
  emptyMessage,
}: RaceTypeContainerProps) {
  const groups = buildRaceGroups(races);
  const hasNamedGroups = groups.some((group) => group.title !== null);

  return (
    <section className="space-y-4 rounded-xl border border-line bg-white p-4 shadow-card">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <p className="text-xs text-slate">{subtitle}</p>
        </div>
        <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate">
          {races.length} race{races.length === 1 ? '' : 's'}
        </span>
      </header>

      {races.length === 0 && (
        <p className="rounded-lg border border-dashed border-line bg-paper px-3 py-2 text-sm text-slate">{emptyMessage}</p>
      )}

      {groups.map((group) => {
        const groupTitle = group.title || (hasNamedGroups ? fallbackGroupTitle : null);

        return (
          <section key={`${title}-${group.key}`} className="space-y-3 rounded-lg border border-line/70 bg-paper/40 p-3">
            {groupTitle && <h4 className="font-display text-base font-semibold text-ink">{groupTitle}</h4>}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.races.map((race) => (
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
      })}
    </section>
  );
}

export function ElectionSection({ section }: ElectionSectionProps) {
  const offices = section.races.filter((race) => race.raceType === 'office');
  const ballotQuestions = section.races.filter((race) => race.raceType === 'ballot');

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

      <div className="space-y-4">
        <RaceTypeContainer
          title="Elected Positions"
          subtitle="Candidate contests where winners are seated"
          races={offices}
          electionStatus={section.status}
          accentClassName="bg-sage"
          fallbackGroupTitle="Other Positions"
          emptyMessage="No elected position races are configured for this election."
        />

        <RaceTypeContainer
          title="Ballot Questions"
          subtitle="Articles, measures, and yes/no questions"
          races={ballotQuestions}
          electionStatus={section.status}
          accentClassName="bg-clay"
          fallbackGroupTitle="Other Questions"
          emptyMessage="No ballot questions are configured for this election."
        />
      </div>
    </section>
  );
}
