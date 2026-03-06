function envOrFallback(value: string | undefined, fallback: string): string {
  const normalized = (value || '').trim();
  return normalized.length > 0 ? normalized : fallback;
}

const defaultThemeLocation = 'City of Mos Eisley, Tatooine';

const locationLabel = envOrFallback(import.meta.env.VITE_THEME_LOCATION, defaultThemeLocation);

export const appTheme = {
  locationLabel,
  dashboardHeading: 'Election Results',
  dashboardSubheading: 'Unofficial results from across Mos Eisley precincts and school voting.',
  browserTitle: `${locationLabel} Election Results`,
  citySectionTitle: `${locationLabel} Election`,
  schoolSectionTitle: `${locationLabel} School District Election`,
};
