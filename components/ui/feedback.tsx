import { CircleNotchIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Spinner({ className, label = "Memuat" }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-body-sm text-ink-muted", className)}>
      <CircleNotchIcon size={18} className="animate-spin" aria-hidden />
      {label}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-control bg-border", className)} />;
}

/** Empty state: says what is missing and what to do next. */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-1 p-4 text-body-sm", className)}>
      <p className="font-medium text-ink">{title}</p>
      {description ? <p className="text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** Error state: what happened, plus a retry. */
export function ErrorState({
  title = "Data belum bisa dimuat",
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("flex flex-col items-start gap-1 p-4 text-body-sm", className)}>
      <p className="flex items-center gap-2 font-medium text-danger">
        <WarningCircleIcon size={18} aria-hidden />
        {title}
      </p>
      {description ? <p className="text-ink-muted">{description}</p> : null}
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-2" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
