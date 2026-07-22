export default function DashboardLoading() {
  return (
    <div className="space-y-4 p-1" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-clay/80" />
      <div className="h-4 w-72 animate-pulse rounded bg-clay/60" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-clay/70" />
        ))}
      </div>
      <div className="mt-4 h-40 animate-pulse rounded-2xl bg-clay/50" />
    </div>
  );
}
