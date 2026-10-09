import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

/* Geist: a neutral grotesque that suits a methods-section tone; Geist Mono carries
   every numeral that should line up (prices, counts, filenames). display: swap for CLS. */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bedah Data — pengolahan data skripsi dan penelitian",
    template: "%s | Bedah Data",
  },
  description:
    "Layanan olah data akademik: konsultasi metodologi, data bersih, syntax uji, dan laporan hasil analisis untuk skripsi, tesis, dan penelitian.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          Lewati ke konten
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
