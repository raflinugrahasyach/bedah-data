import { listOrders } from "@/services/orders";
import { KanbanBoard } from "@/components/admin/kanban-board";

export const instant = false;

export const metadata = {
  title: "Pipeline Pesanan Analis",
};

export default async function AdminPage() {
  const orders = await listOrders();

  return (
    <div className="space-y-6">
      {/* Standard page header (h1 + subtitle only, strictly no hero per no-slop-ui) */}
      <div>
        <h1 className="text-h1 font-semibold text-ink tracking-tight">
          Pipeline Pesanan Analisis
        </h1>
        <p className="mt-1 text-body-sm text-ink-muted">
          Kelola alur pengerjaan dari intake brief, proses running syntax oleh analis, uji QC, hingga penyerahan berkas.
        </p>
      </div>

      <KanbanBoard initialOrders={orders} />
    </div>
  );
}
