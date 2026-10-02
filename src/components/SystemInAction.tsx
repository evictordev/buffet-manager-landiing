import { useRef } from "react";
import { gsap } from "../lib/gsap";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import { crops, shots } from "../assets";
import { BrowserFrame, ScreenCrop, ShotImage } from "./ui/Screens";

const NOTES = [
  { title: "Menu lateral por módulo", text: "Eventos, profissionais, catálogo e clientes sempre à mão." },
  { title: "Indicadores em destaque", text: "Totais e valores aparecem em cards, logo no topo de cada tela." },
  { title: "Tabelas completas", text: "Busca, filtros, ordenação, importação e exportação em cada lista." },
];

export default function SystemInAction() {
  const root = useRef<HTMLElement>(null);

  useScrollAnimations(root, (mode) => {
    const desktop = mode === "desktop";

    gsap.from(".sia-head > *", {
      y: 26,
      opacity: 0,
      stagger: 0.12,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ".sia-head", start: "top 85%" },
    });

    // A tela começa pequena e cresce conforme o scroll: "entrar no sistema".
    gsap.fromTo(
      ".sia-frame",
      { scale: desktop ? 0.7 : 0.9, y: desktop ? 90 : 30, rotateX: desktop ? 10 : 0 },
      {
        scale: 1,
        y: 0,
        rotateX: 0,
        ease: "none",
        scrollTrigger: { trigger: ".sia-stage", start: "top 92%", end: "top 22%", scrub: 0.7 },
      },
    );

    if (desktop) {
      // Elementos ao redor surgem depois que a tela quase ocupa o espaço
      gsap.from(".sia-float-l", {
        x: -140,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ".sia-stage", start: "top 45%", end: "top 8%", scrub: true },
      });
      gsap.from(".sia-float-r", {
        x: 140,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ".sia-stage", start: "top 38%", end: "top 2%", scrub: true },
      });
      // Parallax leve nas camadas flutuantes
      const st = { trigger: ".sia-stage", start: "top bottom", end: "bottom top", scrub: 0.8 };
      gsap.fromTo(".sia-float-l-inner", { y: 40 }, { y: -50, ease: "none", scrollTrigger: st });
      gsap.fromTo(".sia-float-r-inner", { y: 70 }, { y: -30, ease: "none", scrollTrigger: st });
    }

    gsap.from(".sia-note", {
      y: desktop ? 30 : 20,
      opacity: 0,
      stagger: 0.14,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: ".sia-notes", start: "top 88%" },
    });
  });

  return (
    <section ref={root} className="relative overflow-hidden bg-night py-28 text-white lg:py-40" aria-labelledby="sistema-em-acao">
      <div className="container-x">
        <div className="sia-head mx-auto max-w-3xl text-center">
          <h2 id="sistema-em-acao" className="h-display text-[clamp(2rem,4.8vw,3.8rem)]">
            Entre no sistema e acompanhe tudo de perto.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-white/60">
            Telas pensadas para o dia a dia: informação clara, ações no lugar certo e nada que atrapalhe a rotina.
          </p>
        </div>

        <div className="sia-stage relative mx-auto mt-16 max-w-[1120px] lg:mt-24" style={{ perspective: "1800px" }}>
          <div className="sia-frame will-change-transform" style={{ transformOrigin: "50% 100%" }}>
            <BrowserFrame className="!shadow-[0_60px_120px_-40px_rgba(79,70,229,0.45)]">
              <ShotImage shot={shots.utensilios} />
            </BrowserFrame>
          </div>

          <div className="sia-float-l absolute -left-16 top-[10%] hidden w-56 2xl:block xl:-left-12">
            <div className="sia-float-l-inner overflow-hidden rounded-xl border border-white/10 shadow-chip">
              <ScreenCrop shot={shots.dashboard} crop={crops.dashNotifications} />
            </div>
          </div>
          <div className="sia-float-r absolute -right-12 bottom-[14%] hidden w-80 xl:block">
            <div className="sia-float-r-inner overflow-hidden rounded-xl border border-white/10 shadow-chip">
              <ScreenCrop shot={shots.dashboard} crop={crops.dashKpis} />
            </div>
          </div>
        </div>

        <div className="sia-notes mx-auto mt-20 grid max-w-[1120px] gap-10 md:grid-cols-3 lg:mt-28">
          {NOTES.map((n) => (
            <div key={n.title} className="sia-note border-t border-white/15 pt-6">
              <h3 className="text-lg font-medium tracking-tight">{n.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/60">{n.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
