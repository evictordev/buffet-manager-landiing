import { useRef } from "react";
import { Check } from "lucide-react";
import { gsap } from "../lib/gsap";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import { crops, shots } from "../assets";
import { BrowserFrame, ScreenCrop } from "./ui/Screens";

const DETAILS = [
  "Dados centralizados em um só lugar",
  "Importação e exportação de planilhas",
  "Indicadores claros de utensílios e perdas",
];

export default function Benefits() {
  const root = useRef<HTMLElement>(null);

  useScrollAnimations(root, (mode) => {
    const desktop = mode === "desktop";

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: { trigger: root.current, start: "top 68%" },
    });

    tl.from(".ben-text", { x: desktop ? -90 : 0, y: desktop ? 0 : 30, opacity: 0, duration: 1 })
      .from(
        ".ben-media",
        {
          x: desktop ? 110 : 0,
          y: desktop ? 0 : 40,
          opacity: 0,
          clipPath: "inset(0 0 0 22%)",
          duration: 1.2,
          clearProps: "clipPath",
        },
        "<0.1",
      )
      .from(".ben-detail", { y: 16, opacity: 0, stagger: 0.12, duration: 0.7 }, "-=0.5")
      .from(".ben-chip", { y: 30, scale: 0.92, opacity: 0, duration: 0.8 }, "-=0.5");

    if (desktop) {
      gsap.fromTo(
        ".ben-chip-wrap",
        { y: 30 },
        {
          y: -30,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8 },
        },
      );
    }
  });

  return (
    <section ref={root} id="beneficios" className="tone-steel relative py-28 lg:py-44" aria-labelledby="beneficios-titulo">
      <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="ben-text lg:col-span-5">
          <h2 id="beneficios-titulo" className="h-display text-[clamp(2rem,4.4vw,3.4rem)]">
            Feito para facilitar sua rotina.
          </h2>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-muted">
            Menos planilhas e menos retrabalho. Com tudo organizado, sobra tempo para o que realmente importa:
            entregar eventos memoráveis.
          </p>
          <ul className="mt-8 space-y-4">
            {DETAILS.map((d) => (
              <li key={d} className="ben-detail flex items-start gap-3 text-[16px]">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald/15 text-emerald">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                </span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-7">
          <div className="ben-media">
            <BrowserFrame>
              <ScreenCrop shot={shots.utensilios} crop={{ x: 337, y: 20, w: 1488, h: 760 }} className="!rounded-none" />
            </BrowserFrame>
          </div>
          <div className="ben-chip-wrap absolute -bottom-8 left-4 hidden w-56 sm:block lg:-left-10">
            <div className="ben-chip overflow-hidden rounded-xl border border-white/10 shadow-chip">
              <ScreenCrop shot={shots.utensilios} crop={crops.utKpiEstoque} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
