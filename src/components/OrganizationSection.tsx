import { useRef } from "react";
import { CalendarDays, ClipboardCheck, FileSignature, Receipt, Users, type LucideIcon } from "lucide-react";
import { gsap } from "../lib/gsap";
import { useScrollAnimations } from "../hooks/useScrollAnimations";

const FLOW: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Users, title: "Clientes", text: "Quem contrata o seu buffet." },
  { icon: Receipt, title: "Orçamentos", text: "As propostas em andamento." },
  { icon: FileSignature, title: "Contratos", text: "O que foi acertado, registrado." },
  { icon: CalendarDays, title: "Eventos", text: "Cada evento na sua agenda." },
  { icon: ClipboardCheck, title: "Conferência", text: "O que saiu e o que voltou." },
];

export default function OrganizationSection() {
  const root = useRef<HTMLElement>(null);

  useScrollAnimations(root, (mode) => {
    const desktop = mode === "desktop";

    gsap.from(".org-head > *", {
      y: 26,
      opacity: 0,
      stagger: 0.12,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ".org-head", start: "top 85%" },
    });

    const nodes = gsap.utils.toArray<HTMLElement>(".org-node");
    const dots = gsap.utils.toArray<HTMLElement>(".org-dot");
    const n = nodes.length;

    gsap.set(".org-line-fill", {
      transformOrigin: desktop ? "0 50%" : "50% 0",
      scaleX: desktop ? 0 : 1,
      scaleY: desktop ? 1 : 0,
    });
    gsap.set(nodes, { opacity: 0.3, y: desktop ? 18 : 0, x: desktop ? 0 : 18 });

    // Uma linha discreta liga os módulos, e cada um se acende quando a linha chega.
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".org-flow",
        start: desktop ? "top 72%" : "top 80%",
        end: desktop ? "top 28%" : "bottom 60%",
        scrub: 0.6,
      },
    });

    tl.to(".org-line-fill", desktop ? { scaleX: 1, duration: n } : { scaleY: 1, duration: n }, 0);
    nodes.forEach((node, i) => {
      tl.to(node, { opacity: 1, y: 0, x: 0, duration: 0.6, ease: "power2.out" }, i * 0.95)
        .to(
          dots[i],
          { backgroundColor: "#f1f2fa", color: "#06061c", borderColor: "#f1f2fa", duration: 0.4 },
          i * 0.95,
        );
    });
  });

  return (
    <section ref={root} className="tone-navy relative py-28 lg:py-44" aria-labelledby="organizacao">
      <div className="container-x">
        <div className="org-head max-w-3xl">
          <h2 id="organizacao" className="h-display text-[clamp(2rem,4.6vw,3.6rem)]">
            Tudo conectado, do primeiro contato ao evento.
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
            Em vez de informações soltas em lugares diferentes, cada etapa do trabalho fica ligada à seguinte.
          </p>
        </div>

        <div className="org-flow relative mt-16 flex flex-col gap-10 lg:mt-24 lg:flex-row lg:gap-0">
          {/* Linhas (desktop: horizontal; mobile: vertical) */}
          <span
            aria-hidden="true"
            className="absolute bottom-7 left-7 top-7 w-px bg-line lg:inset-x-[10%] lg:bottom-auto lg:left-[10%] lg:right-[10%] lg:top-7 lg:h-px lg:w-auto"
          />
          <span
            aria-hidden="true"
            className="org-line-fill absolute bottom-7 left-7 top-7 w-px bg-ink/70 lg:bottom-auto lg:left-[10%] lg:right-[10%] lg:top-7 lg:h-px lg:w-auto"
          />

          {FLOW.map(({ icon: Icon, title, text }) => (
            <div key={title} className="org-node relative flex items-start gap-5 lg:flex-1 lg:flex-col lg:items-center lg:text-center">
              <span className="org-dot grid h-14 w-14 shrink-0 place-items-center rounded-full border border-line bg-night-2 text-ink">
                <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div className="lg:mt-5">
                <h3 className="text-lg font-medium tracking-tight">{title}</h3>
                <p className="mt-1 max-w-[14rem] text-[15px] leading-relaxed text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
