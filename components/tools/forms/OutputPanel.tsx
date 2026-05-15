import { CopyButton } from "@/components/tools/forms/CopyButton";
import { cn } from "@/lib/utils";

export function OutputPanel({
  value,
  title = "Output",
  error,
  className
}: {
  value: string;
  title?: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <CopyButton value={value} />
      </div>
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <pre className="max-h-[520px] min-h-36 overflow-auto rounded-xl border bg-muted/40 p-3 text-sm leading-6">
        {value || "Output will appear here."}
      </pre>
    </div>
  );
}
