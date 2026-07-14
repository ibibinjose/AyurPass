export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-1.5 text-3xl font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
    </div>
  );
}
