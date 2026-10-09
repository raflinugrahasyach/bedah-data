import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { Services } from "@/components/landing/services";
import { Workflow } from "@/components/landing/workflow";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { CtaSection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-bg">
      <Navbar />
      <main id="konten" className="flex-1">
        <Hero />
        <TrustBar />
        <ProblemSolution />
        <Services />
        <Workflow />
        <Pricing />
        <Testimonials />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
