import { useRef } from "react";
import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  ConciergeBell,
  FileSignature,
  PackageOpen,
  Receipt,
  UserCog,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import { crops, shots } from "../assets";
import { ScreenCrop } from "./ui/Screens";

type Feature = { icon: LucideIcon; title: string; text: string };

const SMALL: Feature[] = [
  { icon: Users, title: "Clientes", text: "Cadastro de clientes organizado e sempre à mão." },
  { icon: CalendarDays, title: "Gestão de eventos", text: "Acompanhe cada evento da sua agenda." },
  { icon: Receipt, title: "Orçamentos", text: "Monte e acompanhe orçamentos em um só fluxo." },
  { icon: FileSignature, title: "Contratos", text: "Contratos reunidos junto ao restante da operação." },
  { icon: ClipboardCheck, title: "Conferência", text: "Confira o que sai e o que volta de cada evento." },
  { icon: ConciergeBell, title: "Serviços extras", text: "Inclua serviços adicionais nos seus eventos." },
  { icon: PackageOpen, title: "Pacotes de eventos", text: "Organize suas ofertas em pacotes." },
  { icon: UserCog, title: "Profissionais", text: "Cargos, disponibilidade e folha de pagamento da equipe." },
];

export default function Features() {
  const root = useRef<HTMLElement>(null);

  useScrollAnimations(root, (mode) => {
    const desktop = mode === "desktop";

    gsap.from(".feat-head > *", {
      y: 28,
      opacity: 0,
      stagger: 0.12,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ".feat-head", start: "top 82%" },
    });

    // Destaques com imagem: entram um por vez, de lados opostos
    gsap.utils.toArray<HTMLElement>(".feat-big").forEach((el, i) => {
      gsap.from(el, {
        x: desktop ? (i % 2 === 0 ? -70 : 70) : 0,
        y: desktop ? 0 : 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
      gsap.fromTo(
        el.querySelector(".feat-img"),
        { scale: 1.12 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 90%", end: "bottom 40%", scrub: true },
        },
      );
    });

    // Cartões menores: sequência com stagger
    const cells = gsap.utils.toArray<HTMLElement>(".feat-cell");
    gsap.set(cells, { opacity: 0, y: desktop ? 36 : 24 });
    // ScrollTrigger.batch dispara as entradas em lotes, respeitando a ordem visual.
    ScrollTrigger.batch(cells, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { opacity: 1, y: 0, stagger: 0.09, duration: 0.8, ease: "power3.out", overwrite: true }),
    });
  });

  return (
    <section ref={root} id="funcionalidades" className="relative py-28 lg:py-44" aria-labelledby="funcionalidades-titulo">
      <div className="container-x">
        <div className="feat-head max-w-3xl">
          <h2 id="funcionalidades-titulo" className="h-display text-[clamp(2rem,4.6vw,3.6rem)]">
            Cada parte da operação, no seu lugar.
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
            Os módulos do Buffet Manager cobrem o dia a dia de quem organiza eventos, do cadastro do cliente à
            conferência dos utensílios.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-2">
          <article className="feat-big overflow-hidden rounded-2xl border border-line bg-night-2">
            <div className="p-7 lg:p-9">
              <UtensilsCrossed className="h-6 w-6 text-accent" strokeWidth={1.6} aria-hidden="true" />
              <h3 className="h-display mt-5 text-3xl">Catálogo de utensílios</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
                Inventário completo com busca, filtros e ordenação. Importe e exporte planilhas e acompanhe
                quantidade, material e valor de cada item.
              </p>
            </div>
            <div className="overflow-hidden">
              <div className="feat-img origin-top-left will-change-transform">
                <ScreenCrop shot={shots.utensilios} crop={crops.utTable} />
              </div>
            </div>
          </article>

          <article className="feat-big flex flex-col overflow-hidden rounded-2xl border border-line bg-night-2">
            <div className="p-7 lg:p-9">
              <BarChart3 className="h-6 w-6 text-accent" strokeWidth={1.6} aria-hidden="true" />
              <h3 className="h-display mt-5 text-3xl">Utensílios e perdas</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
                Veja unidades enviadas, devolvidas e perdidas por período, com taxa de perda, índice de retorno e
                prejuízo estimado.
              </p>
            </div>
            <div className="mt-auto overflow-hidden">
              <div className="feat-img origin-top-left will-change-transform">
                <ScreenCrop shot={shots.dashboard} crop={crops.dashKpis} />
              </div>
            </div>
          </article>
        </div>

        {/* Grade única com divisórias finas */}
        <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {SMALL.map(({ icon: Icon, title, text }) => (
            <div key={title} className="feat-cell bg-night-2 p-7">
              <Icon className="h-5 w-5 text-accent" strokeWidth={1.6} aria-hidden="true" />
              <h3 className="mt-5 text-[17px] font-medium tracking-tight">{title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
