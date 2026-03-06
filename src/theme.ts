function envOrFallback(value: string | undefined, fallback: string): string {
  const normalized = (value || '').trim();
  return normalized.length > 0 ? normalized : fallback;
}

const defaultThemeLocation = 'City of Mos Eisley, Tatooine';

const locationLabel = envOrFallback(import.meta.env.VITE_THEME_LOCATION, defaultThemeLocation);

export const appTheme = {
  locationLabel,
  dashboardHeading: 'Municipal Election Results',
  dashboardSubheading: 'Live unofficial results from published election spreadsheets.',
  browserTitle: `${locationLabel} Election Results`,
  citySectionTitle: `${locationLabel} Municipal Election`,
  schoolSectionTitle: `${locationLabel} School District Election`,
};
