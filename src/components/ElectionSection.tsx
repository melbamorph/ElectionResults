import { ElectionSectionData, NormalizedRace } from '../types';
import { RaceCard } from './RaceCard';

interface ElectionSectionProps {
  section: ElectionSectionData;
}

type BallotSectionId = 'articles' | 'questions' | 'amendments';

interface RaceTypeContainerProps {
  title: string;
  subtitle: string;
  races: NormalizedRace[];
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

function normalizeBallotLabel(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function getBallotSectionId(race: NormalizedRace): BallotSectionId {
  const groupLabel = normalizeBallotLabel(race.raceGroup);
  const raceLabel = normalizeBallotLabel(race.race);

  if (groupLabel.includes('amendment') || raceLabel.includes('amendment')) {
    return 'amendments';
  }

  if (groupLabel.includes('article') || raceLabel.includes('article')) {
    return 'articles';
  }

  return 'questions';
}

function RaceTypeContainer({
  title,
  subtitle,
  races,
  accentClassName,
  fallbackGroupTitle,
  emptyMessage,
}: RaceTypeContainerProps) {
  const groups = buildRaceGroups(races);
  const hasNamedGroups = groups.some((group) => group.title !== null);

  return (
    <section className="space-y-4 rounded-xl border border-line bg-white p-4 shadow-card sm:p-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
          <p className="text-sm text-slate">{subtitle}</p>
        </div>
        <span className="inline-flex min-h-11 items-center rounded-full bg-paper px-3 py-2 text-sm font-semibold uppercase tracking-wide text-slate">
          {races.length} race{races.length === 1 ? '' : 's'}
        </span>
      </header>

      {races.length === 0 && (
        <p className="rounded-lg border border-dashed border-line bg-paper px-4 py-3 text-base text-slate">{emptyMessage}</p>
      )}

      {groups.map((group) => {
        const groupTitle = group.title || (hasNamedGroups ? fallbackGroupTitle : null);

        return (
          <section
            key={`${title}-${group.key}`}
            className="space-y-3 rounded-xl border border-line/70 bg-paper/55 p-3 sm:p-4 md:overflow-hidden md:p-0"
          >
            {groupTitle && <h4 className="font-display text-lg font-semibold text-ink md:px-4 md:pt-4">{groupTitle}</h4>}
            <div data-testid={`race-group-${group.key}-list`} className="space-y-3 md:space-y-0 md:divide-y md:divide-line/70">
              {group.races.map((race) => (
                <RaceCard
                  key={`${race.election}-${race.race}`}
                  race={race}
                  compact
                  accentClassName={accentClassName}
                  layoutMode="responsive-list"
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
  const ballotRaces = section.races.filter((race) => race.raceType === 'ballot');
  const articleRaces = ballotRaces.filter((race) => getBallotSectionId(race) === 'articles');
  const questionRaces = ballotRaces.filter((race) => getBallotSectionId(race) === 'questions');
  const amendmentRaces = ballotRaces.filter((race) => getBallotSectionId(race) === 'amendments');
  const isSchoolSection = section.id === 'SCHOOL';

  return (
    <section className="space-y-5 rounded-2xl border border-line bg-white/70 p-4 sm:p-5 md:p-6">
      <header>
        <h2 className="font-display text-3xl font-semibold text-ink">{section.title}</h2>
      </header>

      <div className="space-y-4">
        <RaceTypeContainer
          title="Elected Positions"
          subtitle="Candidate contests where winners are seated"
          races={offices}
          accentClassName="bg-sage"
          fallbackGroupTitle="Other Positions"
          emptyMessage="No elected position races are configured for this election."
        />

        {isSchoolSection ? (
          <RaceTypeContainer
            title="Articles"
            subtitle="Articles, measures, and yes/no questions"
            races={ballotRaces}
            accentClassName="bg-clay"
            fallbackGroupTitle="Other Articles"
            emptyMessage="No articles are configured for this election."
          />
        ) : (
          <>
            <RaceTypeContainer
              title="Articles"
              subtitle="Municipal articles and warrant items"
              races={articleRaces}
              accentClassName="bg-clay"
              fallbackGroupTitle="Other Articles"
              emptyMessage="No articles are configured for this election."
            />

            <RaceTypeContainer
              title="Ballot Questions"
              subtitle="Measures and yes/no questions"
              races={questionRaces}
              accentClassName="bg-clay"
              fallbackGroupTitle="Other Questions"
              emptyMessage="No ballot questions are configured for this election."
            />

            <RaceTypeContainer
              title="Amendments"
              subtitle="Charter and constitutional amendments"
              races={amendmentRaces}
              accentClassName="bg-clay"
              fallbackGroupTitle="Other Amendments"
              emptyMessage="No amendments are configured for this election."
            />
          </>
        )}
      </div>
    </section>
  );
}
