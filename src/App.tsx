import { ElectionHeader } from './components/ElectionHeader';
import { ElectionSection } from './components/ElectionSection';
import { ReportingSummary } from './components/ReportingSummary';
import { useElectionData } from './hooks/useElectionData';

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
          <ReportingSummary summary={data.summary} />
          <ElectionSection section={data.sections.CITY} wardStatuses={data.wardStatuses} />
          <ElectionSection section={data.sections.SCHOOL} />
        </main>
      </div>
    </div>
  );
}
