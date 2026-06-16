import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Screen({
  title,
  subtitle,
  back = true,
  right,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  return (
    <div className={cn("flex flex-col gap-5 px-5 pb-10 pt-4", className)}>
      {(title || back || right) && (
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {back && (
              <button
                onClick={() => router.history.back()}
                className="tap flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground/80 hover:text-foreground"
                aria-label="Back"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              {title && <h1 className="text-xl font-semibold tracking-tight">{title}</h1>}
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {right}
        </header>
      )}
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{children}</h2>
      {action}
    </div>
  );
}

export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  to,
  onClick,
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  to?: string;
  onClick?: () => void;
}) {
  const inner = (
    <div className="tap flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-surface-2/60">
      {leading}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{title}</div>
        {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {trailing}
    </div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {inner}
    </button>
  );
}
