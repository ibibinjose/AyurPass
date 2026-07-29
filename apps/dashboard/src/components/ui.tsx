import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const fieldClasses =
  "w-full rounded-2xl border border-hairline/80 bg-surface/90 px-4 py-2.5 text-base sm:text-sm font-medium text-foreground placeholder:font-normal placeholder:text-ink-muted/70 transition-all duration-200 focus:border-leaf focus:bg-surface focus:outline-none focus:ring-4 focus:ring-leaf/15 disabled:cursor-not-allowed disabled:bg-clay/40 disabled:opacity-70 shadow-xs";

export function Field({
  label,
  children,
  hint,
  error,
  optional,
  required,
  htmlFor,
  className = "",
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string | null;
  /** Shows a subtle “Optional” chip next to the label. */
  optional?: boolean;
  /** Shows a required asterisk (visual only — still set required on the input). */
  required?: boolean;
  htmlFor?: string;
  className?: string;
}) {
  const isSpacer = !label.trim() || label === "\u00a0";
  return (
    <label htmlFor={htmlFor} className={`block ${className}`}>
      {!isSpacer ? (
        <span className="mb-1.5 flex min-h-[1.25rem] flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold text-foreground">
            {label}
            {required ? (
              <span className="ml-0.5 text-red-600" aria-hidden>
                *
              </span>
            ) : null}
          </span>
          {optional ? (
            <span className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Optional
            </span>
          ) : null}
        </span>
      ) : (
        <span className="mb-1.5 block min-h-[1.25rem]" aria-hidden>
          &nbsp;
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs font-semibold text-red-700" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs font-medium leading-relaxed text-ink-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClasses} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${fieldClasses} cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.85rem_center] bg-no-repeat pr-10 ${props.className ?? ""}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%232f5a44' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.2' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        ...props.style,
      }}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${fieldClasses} min-h-[6.5rem] resize-y leading-relaxed ${props.className ?? ""}`}
    />
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "soft" | "gold" | "glass";
}) {
  const styles = {
    primary:
      "bg-gradient-to-r from-forest to-forest-deep text-white shadow-sm hover:shadow-md hover:from-forest-deep hover:to-forest disabled:opacity-50",
    gold: "bg-gradient-to-r from-gold via-amber-500 to-gold text-forest-deep font-semibold shadow-sm hover:shadow-md hover:brightness-105 disabled:opacity-50",
    glass:
      "glass-surface text-forest font-semibold hover:border-leaf/40 hover:bg-surface shadow-xs disabled:opacity-50",
    soft: "bg-forest text-white font-semibold hover:bg-forest-deep disabled:opacity-50",
    ghost:
      "border border-hairline/80 bg-surface/90 text-foreground hover:border-leaf/50 hover:bg-surface hover:text-forest shadow-2xs",
    danger:
      "border border-red-200/80 bg-red-50/70 text-red-700 hover:border-red-300 hover:bg-red-50 font-medium",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4.5 py-2 text-sm font-semibold transition-all duration-150 btn-press disabled:cursor-not-allowed ${styles} ${className}`}
    />
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-2xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-800 shadow-xs"
    >
      ⚠️ {message}
    </p>
  );
}

export function SuccessNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="rounded-2xl border border-emerald-600/30 bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-xs"
    >
      ✨ {message}
    </p>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-hairline bg-surface/60 px-6 py-12 text-center">
      <p className="font-display text-lg text-forest">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** Page title + optional subtitle — consistent marketing/dashboard headers. */
export function PageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="type-display">{title}</h1>
        {description ? (
          <p className="type-body mt-2 max-w-2xl font-medium sm:mt-2.5">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

/** Pulse placeholders for catalog grids. */
export function CardSkeletonGrid({ count = 6, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-56 animate-pulse rounded-2xl border border-hairline/60 bg-clay/70"
          aria-hidden
        />
      ))}
    </div>
  );
}

export function InlineSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink-muted" role="status">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-hairline border-t-forest"
        aria-hidden
      />
      {label}
    </span>
  );
}

/** Filter / tab chip used across discover, explore, dashboard. */
export function FilterChip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2.5 text-sm font-semibold transition-colors sm:min-h-10 sm:py-2 ${
        active
          ? "bg-forest text-white shadow-[0_2px_8px_rgba(30,50,40,0.14)]"
          : "border border-hairline bg-surface text-ink-secondary hover:border-leaf hover:text-forest"
      }`}
    >
      <span>{children}</span>
      {count !== undefined ? (
        <span
          className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold leading-none ${
            active ? "bg-white/20 text-white" : "bg-clay text-ink-muted"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function Card({
  children,
  className = "",
  onClick,
  onKeyDown,
  role,
  "aria-checked": ariaChecked,
  tabIndex,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  role?: string;
  "aria-checked"?: boolean;
  tabIndex?: number;
}) {
  return (
    <div
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      aria-checked={ariaChecked}
      tabIndex={tabIndex}
      className={`apple-card ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "gold";
  className?: string;
}) {
  const variantStyles = {
    default: "bg-clay text-ink-muted border-hairline",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    gold: "bg-gold/15 text-gold-deep border-gold/30 font-bold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function ToastNote({
  message,
  type = "info",
}: {
  message: string | null;
  type?: "info" | "success" | "error";
}) {
  if (!message) return null;

  const typeStyles = {
    info: "bg-forest-deep text-surface border-white/20",
    success: "bg-emerald-900 text-emerald-100 border-emerald-600/50",
    error: "bg-red-950 text-red-100 border-red-800/50",
  };

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl transition-all ${typeStyles[type]}`}
    >
      <span>{message}</span>
    </div>
  );
}


