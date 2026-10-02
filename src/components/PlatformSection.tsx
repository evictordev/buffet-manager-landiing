import { useRef } from "react";
import { Gauge, Layers, PanelLeft } from "lucide-react";
import { gsap } from "../lib/gsap";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import { crops, shots } from "../assets";
import { BrowserFrame, ScreenCrop, ShotImage } from "./ui/Screens";

const POINTS = [
  {
    icon: Layers,
    title: "Tudo em um só lugar",
    text: "Eventos, profissionais, catálogo e clientes dentro do mesmo sistema.",
  },
  {
    icon: PanelLeft,
    title: "Menu organizado por módulo",
    text: "Cada área tem seu espaço, e você chega a qualquer tela em poucos cliques.",
  },
  {
    icon: Gauge,
    title: "Indicadores à vista",
    text: "Totais, valores e desempenho aparecem em destaque no topo de cada tela.",
  },
];

export default function PlatformSection() {
  const root = useRef<HTMLElement>(null);

  useScrollAnimations(root, (mode) => {
    const desktop = mode === "desktop";

    gsap.from(".plat-head > *", {
      y: 28,
      opacity: 0,
      stagger: 0.12,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ".plat-head", start: "top 82%" },
    });

    // Tela principal entra com escala + clip-path
    gsap.fromTo(
      ".plat-main",
      { scale: desktop ? 0.9 : 0.96, clipPath: "inset(14% 6% 14% 6% round 24px)" },
      {
        scale: 1,
        clipPath: "inset(0% 0% 0% 0% round 16px)",
        ease: "none",
        scrollTrigger: { trigger: ".plat-stage", start: "top 88%", end: "top 38%", scrub: 0.6 },
      },
    );

    if (desktop) {
      // Parallax: três velocidades
      const st = { trigger: ".plat-stage", start: "top bottom", end: "bottom top", scrub: 0.8 };
      gsap.fromTo(".plat-main-wrap", { y: 40 }, { y: -40, ease: "none", scrollTrigger: st });
      gsap.fromTo(".plat-side", { y: 90 }, { y: -50, ease: "none", scrollTrigger: st });
      gsap.fromTo(".plat-kpi", { y: 140 }, { y: -30, ease: "none", scrollTrigger: st });
      gsap.from(".plat-side", {
        x: -80,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ".plat-stage", start: "top 55%", end: "top 20%", scrub: true },
      });
      gsap.from(".plat-kpi", {
        x: 80,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ".plat-stage", start: "top 50%", end: "top 15%", scrub: true },
      });
    }

    gsap.from(".plat-point", {
      y: desktop ? 36 : 24,
      opacity: 0,
      stagger: 0.14,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: { trigger: ".plat-points", start: "top 85%" },
    });
  });

  return (
    <section ref={root} className="tone-indigo relative py-28 lg:py-44" aria-labelledby="plataforma">
      <div className="container-x">
        <div className="plat-head max-w-3xl">
          <h2 id="plataforma" className="h-display text-[clamp(2rem,4.6vw,3.6rem)]">
            Uma plataforma para centralizar sua operação.
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
            O Buffet Manager organiza o que antes ficava espalhado em um sistema único, com telas claras e
            informações sempre atualizadas.
          </p>
        </div>

        <div className="plat-stage relative mt-16 lg:mt-24">
          <div className="plat-main-wrap">
            <div className="plat-main">
              <BrowserFrame>
                <ShotImage shot={shots.dashboard} />
              </BrowserFrame>
            </div>
          </div>

          <div className="plat-side absolute -bottom-20 -left-10 hidden w-40 xl:block">
            <div className="overflow-hidden rounded-xl border border-white/10 shadow-chip">
              <ScreenCrop shot={shots.utensilios} crop={crops.utSidebar} />
            </div>
          </div>
          <div className="plat-kpi absolute -bottom-12 -right-10 hidden w-80 xl:block">
            <div className="overflow-hidden rounded-xl border border-white/10 shadow-chip">
              <ScreenCrop shot={shots.dashboard} crop={crops.dashKpis} />
            </div>
          </div>
        </div>

        <div className="plat-points mt-16 grid gap-10 md:grid-cols-3 lg:mt-36">
          {POINTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="plat-point border-t border-line pt-6">
              <Icon className="h-6 w-6 text-accent" strokeWidth={1.6} aria-hidden="true" />
              <h3 className="mt-5 text-lg font-medium tracking-tight">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
