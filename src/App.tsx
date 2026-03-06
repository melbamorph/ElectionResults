import { useEffect, useState } from 'react';
import { ElectionHeader } from './components/ElectionHeader';
import { ElectionSection } from './components/ElectionSection';
import { ReportingSummary } from './components/ReportingSummary';
import { useElectionData } from './hooks/useElectionData';
import { appTheme } from './theme';

type ResultsPage = 'municipal' | 'school';

const MUNICIPAL_RESULTS_HASH = '#/municipal-results';
const SCHOOL_RESULTS_HASH = '#/school-results';

function pageFromHash(hash: string): ResultsPage {
  const rawPath = hash.trim().startsWith('#') ? hash.trim().slice(1) : hash.trim();
  const normalizedPath = (rawPath.startsWith('/') ? rawPath : `/${rawPath}`)
    .replace(/\/+$/, '')
    .toLowerCase();

  if (normalizedPath === '/school-results' || normalizedPath === '/school') {
    return 'school';
  }

  return 'municipal';
}

interface ResultsPageNavProps {
  currentPage: ResultsPage;
}

function ResultsPageNav({ currentPage }: ResultsPageNavProps) {
  const baseClass =
    'inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition';

  return (
    <nav className="rounded-2xl border border-line bg-white/80 p-3 shadow-card" aria-label="Results pages">
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={MUNICIPAL_RESULTS_HASH}
          className={`${baseClass} ${
            currentPage === 'municipal'
              ? 'border-ink bg-ink text-white'
              : 'border-line bg-paper text-ink hover:border-slate hover:bg-white'
          }`}
          aria-current={currentPage === 'municipal' ? 'page' : undefined}
        >
          Municipal Results
        </a>
        <a
          href={SCHOOL_RESULTS_HASH}
          className={`${baseClass} ${
            currentPage === 'school'
              ? 'border-ink bg-ink text-white'
              : 'border-line bg-paper text-ink hover:border-slate hover:bg-white'
          }`}
          aria-current={currentPage === 'school' ? 'page' : undefined}
        >
          School Results
        </a>
      </div>
    </nav>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-card">
        <p className="font-display text-xl font-semibold text-ink">Loading election results...</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="rounded-2xl border border-alert/30 bg-alert/10 p-8 text-center shadow-card">
        <p className="font-display text-xl font-semibold text-alert">{message}</p>
      </div>
    </div>
  );
}

export default function App() {
  const { data, isLoading, error, lastUpdated } = useElectionData();
  const [currentPage, setCurrentPage] = useState<ResultsPage>(() => pageFromHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => {
      setCurrentPage(pageFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    document.title =
      currentPage === 'school'
        ? `${appTheme.locationLabel} School Election Results`
        : `${appTheme.locationLabel} Municipal Election Results`;
  }, [currentPage]);

  if (isLoading && !data) {
    return <LoadingState />;
  }

  if (!data) {
    return <EmptyState message={error || 'No election data is available.'} />;
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="bg-[radial-gradient(circle_at_top,_#fff_10%,_#f4f2ee_65%,_#ece8df_100%)] pb-10">
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
          <ElectionHeader lastUpdated={lastUpdated} overallFinal={data.overallFinal} error={error} />
          <ResultsPageNav currentPage={currentPage} />
          {currentPage === 'school' ? (
            <ElectionSection section={data.sections.SCHOOL} />
          ) : (
            <>
              <ReportingSummary summary={data.summary} />
              <ElectionSection section={data.sections.CITY} wardStatuses={data.wardStatuses} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
