import { Clock, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { formatDateTime } from "@/lib/utils";
import type { ActivityEntry } from "@/lib/types";

interface ActivityLogProps {
  activity: ActivityEntry[];
}

export function ActivityLog({ activity }: ActivityLogProps) {
  const sorted = [...activity].reverse(); // newest first

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="border-b border-border pb-3">
        <h3 className="text-body font-semibold text-ink flex items-center gap-2">
          <Clock size={18} className="text-primary" />
          <span>Riwayat Aktivitas & Audit Trail</span>
        </h3>
        <p className="mt-0.5 text-caption text-ink-muted">
          Catatan otomatis setiap perubahan status, pembayaran, dan berkas.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {sorted.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 text-caption">
            <div className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
            <div className="flex-1">
              <p className="text-ink font-medium leading-relaxed">{item.text}</p>
              <span className="text-[11px] font-mono text-ink-muted">
                {formatDateTime(item.at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
