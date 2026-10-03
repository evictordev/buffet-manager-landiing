import { useRef } from "react";
import { gsap } from "../lib/gsap";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import HeroNotebook3D from "./HeroNotebook3D";
import Button from "./ui/Button";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useScrollAnimations(root, (mode) => {
    const desktop = mode === "desktop";

    // ── Entrada (carregamento) ────────────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero-eyebrow", { y: 14, opacity: 0, duration: 0.6 })
      .from(".hero-line", { yPercent: 105, duration: 1, stagger: 0.12 }, "-=0.3")
      .from(".hero-sub", { y: 18, opacity: 0, duration: 0.8 }, "-=0.55")
      .from(".hero-cta", { y: 16, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=0.55")
      .from(
        ".hero-mock-intro",
        { x: desktop ? 80 : 0, y: desktop ? 0 : 40, scale: 0.94, opacity: 0, duration: 1.3, ease: "power3.out" },
        "-=0.9",
      );

    // ── Scroll: o notebook sobe de leve enquanto a página rola ────
    if (desktop) {
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.8 };
      gsap.to(".hero-glow", { y: 90, ease: "none", scrollTrigger: st });
      gsap.to(".hero-mock-scroll", { y: -60, ease: "none", scrollTrigger: st });
    }
  });

  return (
    <section ref={root} id="top" className="relative overflow-x-clip pb-24 pt-32 lg:pb-28 lg:pt-40">
      {/* Fundo: brilho suave + grade de pontos */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="hero-glow absolute left-1/2 top-0 h-[620px] w-[1100px] -translate-x-1/2"
          style={{ background: "radial-gradient(closest-side, rgba(79,70,229,0.22), transparent)" }}
        />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 70% 45% at 50% 18%, #000, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 45% at 50% 18%, #000, transparent)",
          }}
        />
      </div>

      <div className="container-x relative">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6">
          <div className="text-center lg:text-left">
            <p className="hero-eyebrow inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-4 py-1.5 text-[13px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
              Solução para gestão de buffets e eventos
            </p>

            <h1 className="h-display mt-7 text-[clamp(2.5rem,4.1vw,3.9rem)]">
              <span className="block overflow-hidden pb-[0.1em]">
                <span className="hero-line block">Gestão</span>
              </span>
              <span className="-mt-[0.1em] block overflow-hidden pb-[0.1em]">
                <span className="hero-line block">para o seu buffet.</span>
              </span>
            </h1>

            <p className="hero-sub mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-muted lg:mx-0 lg:text-lg">
              O Buffet Manager reúne clientes, eventos, orçamentos, equipe e utensílios em um único lugar, para você
              gastar menos tempo com a operação e mais tempo com a experiência dos seus convidados.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <div className="hero-cta w-full sm:w-auto">
                <Button href="#como-funciona" className="w-full sm:w-auto">
                  Conheça o sistema
                </Button>
              </div>
              <div className="hero-cta w-full sm:w-auto">
                <Button href="#funcionalidades" variant="secondary" className="w-full sm:w-auto">
                  Ver funcionalidades
                </Button>
              </div>
            </div>
          </div>

          <div className="hero-mock-intro relative">
            <div className="hero-mock-scroll will-change-transform">
              <HeroNotebook3D />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
