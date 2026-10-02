import { useEffect } from "react";
import { ScrollTrigger } from "./lib/gsap";
import { useAnchorScroll } from "./hooks/useAnchorScroll";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProblemSection from "./components/ProblemSection";
import PlatformSection from "./components/PlatformSection";
import Features from "./components/Features";
import ProductShowcase from "./components/ProductShowcase";
import SystemInAction from "./components/SystemInAction";
import OrganizationSection from "./components/OrganizationSection";
import Benefits from "./components/Benefits";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

export default function App() {
  useAnchorScroll();

  // Recalcula as posições depois que fontes e imagens terminam de carregar.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });
    document.fonts?.ready.then(refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <PlatformSection />
        <Features />
        <ProductShowcase />
        <SystemInAction />
        <OrganizationSection />
        <Benefits />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
