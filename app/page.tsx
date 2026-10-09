import Link from "next/link";
import { Button } from "@/components/ui/button";

/* Phase 1 holding page. Replaced by the real landing page in Phase 3. */
export default function Home() {
  return (
    <main id="konten" className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center gap-4 p-6">
      <h1 className="text-h1 font-semibold">Bedah Data</h1>
      <p className="text-body-lg text-ink-muted">
        Fondasi proyek sudah siap. Halaman utama dan chatbot konsultasi dibangun pada fase berikutnya.
      </p>
      <div>
        <Button asChild>
          <Link href="/">Muat ulang</Link>
        </Button>
      </div>
    </main>
  );
}
