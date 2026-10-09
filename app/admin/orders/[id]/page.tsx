import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/feedback";
import { OrderDetailView } from "@/components/admin/order-detail-view";
import { getOrder } from "@/services/orders";

export const instant = false;

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const res = getOrder(id);
  if (!res.ok) return { title: "Pesanan Tidak Ditemukan" };
  return {
    title: `Lembar Kerja ${res.data.code} — Analis`,
  };
}

async function OrderContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const res = getOrder(id);

  if (!res.ok) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <h1 className="text-h2 font-semibold text-ink">
          Pesanan Tidak Ditemukan
        </h1>
        <p className="mt-2 text-body-sm text-ink-muted">
          Pesanan dengan kode atau ID &quot;{id}&quot; tidak terdaftar di pipeline.
        </p>
        <div className="mt-6">
          <Button asChild variant="primary">
            <Link href="/admin">
              <ArrowLeft size={16} />
              <span>Kembali ke Pipeline</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <OrderDetailView initialOrder={res.data} />;
}

export default function OrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner label="Memuat lembar kerja pesanan..." />
        </div>
      }
    >
      <OrderContent paramsPromise={props.params} />
    </Suspense>
  );
}
