import { useRef } from "react";
import { gsap } from "../lib/gsap";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import { crops, shots } from "../assets";
import { BrowserFrame, ScreenCrop, ShotImage } from "./ui/Screens";

type Layer = "login" | "uten" | "dash";

const STEPS: { label: string; title: string; text: string; layer: Layer }[] = [
  {
    label: "Acesso",
    title: "Entre com e-mail e senha",
    text: "O acesso é simples e direto, com opção de lembrar o login e de recuperar a senha quando precisar.",
    layer: "login",
  },
  {
    label: "Catálogo",
    title: "Seu catálogo, completo",
    text: "Todos os utensílios em uma tabela com material, quantidade e preço, e o total e o valor em estoque logo no topo.",
    layer: "uten",
  },
  {
    label: "Planilhas",
    title: "Importe e exporte planilhas",
    text: "Traga seu inventário de uma planilha ou exporte a lista quando precisar. Busca e filtros ajudam a achar cada item.",
    layer: "uten",
  },
  {
    label: "Perdas",
    title: "Perdas e devoluções sob controle",
    text: "Acompanhe as unidades enviadas, devolvidas e perdidas no período, com taxa de perda e índice de retorno.",
    layer: "dash",
  },
  {
    label: "Avisos",
    title: "Avisos sem sair da tela",
    text: "As convocações para eventos chegam como notificação, e você pode marcar tudo como lido de uma vez.",
    layer: "dash",
  },
];

/**
 * Enquadra um ponto (px, py, em % da imagem) no centro da moldura com zoom s.
 * Mantém a janela visível dentro da imagem, para nunca mostrar área vazia.
 */
function focus(px: number, py: number, s: number) {
  const half = 50 / s;
  const cx = Math.min(100 - half, Math.max(half, px));
  const cy = Math.min(100 - half, Math.max(half, py));
  return { scale: s, xPercent: 50 - cx * s, yPercent: 50 - cy * s };
}

export default function ProductShowcase() {
  const root = useRef<HTMLElement>(null);

  useScrollAnimations(root, (mode) => {
    // ── Mobile / tablet: pilha vertical simples ────────────────────
    if (mode === "mobile") {
      gsap.utils.toArray<HTMLElement>(".sc-m-step").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%" },
        });
      });
      return;
    }

    // ── Desktop: seção fixada, o scroll conduz a história ──────────
    const texts = gsap.utils.toArray<HTMLElement>(".sc-text");
    const labels = gsap.utils.toArray<HTMLElement>(".sc-label");

    gsap.set(".sc-layer", { transformOrigin: "0 0" });
    gsap.set(".sc-layer-uten, .sc-layer-dash", { autoAlpha: 0 });
    gsap.set(".sc-progress", { scaleX: 0, transformOrigin: "0 50%" });
    gsap.set(labels, { opacity: 0.35 });
    gsap.set(labels[0], { opacity: 1 });

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: {
        trigger: ".sc-pin",
        start: "top top",
        end: "+=280%",
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // Troca de texto + rótulo ativo, sincronizada com cada etapa
    const swap = (i: number, at: number) => {
      tl.to(texts[i - 1], { autoAlpha: 0, y: -22, duration: 0.3 }, at)
        .fromTo(texts[i], { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.2)
        .to(labels[i - 1], { opacity: 0.35, duration: 0.3 }, at)
        .to(labels[i], { opacity: 1, duration: 0.3 }, at);
    };

    tl.to(".sc-progress", { scaleX: 1, ease: "none", duration: 5 }, 0);

    // 1 → Login sai, catálogo entra
    swap(1, 1);
    tl.to(".sc-layer-login", { autoAlpha: 0, duration: 0.5 }, 1).fromTo(
      ".sc-layer-uten",
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, duration: 0.6 },
      1,
    );

    // 2 → Zoom na barra de ferramentas (busca, exportar, importar)
    swap(2, 2);
    tl.to(".sc-layer-uten", { ...focus(70, 33, 1.9), duration: 0.8 }, 2);

    // 3 → Painel de perdas
    swap(3, 3);
    tl.to(".sc-layer-uten", { autoAlpha: 0, duration: 0.5 }, 3).fromTo(
      ".sc-layer-dash",
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, duration: 0.6 },
      3,
    );

    // 4 → Zoom nas notificações
    swap(4, 4);
    tl.to(".sc-layer-dash", { ...focus(84, 22, 2.6), duration: 0.8 }, 4);

    // Segura a última etapa um instante antes de liberar o scroll
    tl.set({}, {}, 5);
  });

  return (
    <section ref={root} id="como-funciona" aria-label="Como funciona" className="tone-sky relative">
      {/* ───────── Desktop: pin + scrub ───────── */}
      <div className="sc-pin hidden h-screen min-h-[620px] items-center pb-8 pt-20 motion-safe:lg:flex">
        <div className="container-x grid w-full grid-cols-12 items-center gap-10">
          <div className="col-span-5">
            <h2 className="h-display text-[clamp(2rem,3.4vw,3rem)]">Veja o Buffet Manager por dentro.</h2>

            <div className="relative mt-8">
              <ul className="flex justify-between text-[13px] text-ink">
                {STEPS.map((s) => (
                  <li key={s.label} className="sc-label pb-3">
                    {s.label}
                  </li>
                ))}
              </ul>
              <span className="absolute inset-x-0 bottom-0 h-px bg-line" />
              <span className="sc-progress absolute inset-x-0 bottom-0 h-px bg-accent" />
            </div>

            <div className="relative mt-8 h-[11rem]">
              {STEPS.map((s) => (
                <div key={s.title} className="sc-text absolute inset-x-0 top-0">
                  <h3 className="h-display text-[1.75rem]">{s.title}</h3>
                  <p className="mt-3 max-w-md text-[16px] leading-relaxed text-muted">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-7 flex justify-end">
            <BrowserFrame style={{ width: "min(100%, calc((100vh - 9rem) * 1.717))" }}>
              <div className="relative overflow-hidden bg-night" style={{ aspectRatio: "1916 / 1116" }}>
                <div className="sc-layer sc-layer-login absolute inset-0 will-change-transform">
                  <ShotImage shot={shots.login} />
                </div>
                <div className="sc-layer sc-layer-uten absolute inset-0 will-change-transform">
                  <ShotImage shot={shots.utensilios} />
                </div>
                <div className="sc-layer sc-layer-dash absolute inset-0 will-change-transform">
                  <ShotImage shot={shots.dashboard} />
                </div>
              </div>
            </BrowserFrame>
          </div>
        </div>
      </div>

      {/* ───────── Mobile / tablet / movimento reduzido ───────── */}
      <div className="container-x block py-24 motion-safe:lg:hidden">
        <h2 className="h-display text-[clamp(2rem,7vw,2.75rem)]">Veja o Buffet Manager por dentro.</h2>

        <div className="mt-12 space-y-16">
          {STEPS.map((s, i) => (
            <article key={s.title} className="sc-m-step">
              {i === 4 ? (
                <div className="mx-auto w-full max-w-xs overflow-hidden rounded-2xl border border-white/10 shadow-chip">
                  <ScreenCrop shot={shots.dashboard} crop={crops.dashNotifications} />
                </div>
              ) : i === 2 ? (
                <div className="overflow-hidden rounded-2xl border border-white/10 shadow-chip">
                  <ScreenCrop shot={shots.utensilios} crop={crops.utToolbarArea} />
                </div>
              ) : (
                <BrowserFrame>
                  <ShotImage
                    shot={s.layer === "login" ? shots.login : s.layer === "uten" ? shots.utensilios : shots.dashboard}
                  />
                </BrowserFrame>
              )}
              <h3 className="h-display mt-6 text-2xl">{s.title}</h3>
              <p className="mt-2 max-w-md text-[16px] leading-relaxed text-muted">{s.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
