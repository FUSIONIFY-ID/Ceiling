import { CinematicHero } from "@/components/home/cinematic-hero";
import { ConcurrencySection } from "@/components/home/concurrency-section";
import { FinalCta, TechStrip } from "@/components/home/final-cta";
import { MechanismScroll } from "@/components/home/mechanism-scroll";
import { OnchainProofSection } from "@/components/home/onchain-proof-section";
import { ProblemStory } from "@/components/home/problem-story";
import { RecomputationSection } from "@/components/home/recomputation-section";
import { SiteNav } from "@/components/home/site-nav";
import { UpperBoundSection } from "@/components/home/upper-bound-section";
import { Footer } from "@/components/site-shell";

import "./home.css";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="home">
        <CinematicHero />
        <UpperBoundSection />
        <ProblemStory />
        <MechanismScroll />
        <RecomputationSection />
        <OnchainProofSection />
        <ConcurrencySection />
        <TechStrip />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
