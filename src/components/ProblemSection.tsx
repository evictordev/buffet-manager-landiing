import { useRef } from "react";
import { gsap } from "../lib/gsap";
import { useScrollAnimations } from "../hooks/useScrollAnimations";

const STATEMENT = "Gerenciar um buffet não precisa ser complicado.".split(" ");

const PROBLEMS = [
  {
    title: "Informações espalhadas",
    text: "Planilhas, conversas e anotações soltas. Ninguém tem certeza de onde está o dado mais recente.",
  },
  {
    title: "Controle manual de eventos",
    text: "Cada evento exige acompanhamento detalhado, e boa parte dele ainda depende de memória e papel.",
  },
  {
    title: "Dificuldade para acompanhar orçamentos",
    text: "Propostas em andamento se perdem no meio de mensagens e arquivos diferentes.",
  },
  {
    title: "Falta de organização financeira",
    text: "Sem uma visão reunida, fica difícil saber como está a operação antes do próximo evento.",
  },
  {
    title: "Processos repetitivos",
    text: "As mesmas tarefas refeitas a cada evento tomam o tempo que deveria ir para o cliente.",
  },
];

export default function ProblemSection() {
  const root = useRef<HTMLElement>(null);

  useScrollAnimations(root, (mode) => {
    const desktop = mode === "desktop";

    // A frase se acende palavra por palavra, acompanhando o scroll.
    gsap.fromTo(
      ".problem-word",
      { opacity: 0.14 },
      {
        opacity: 1,
        stagger: 0.12,
        ease: "none",
        scrollTrigger: { trigger: ".problem-statement", start: "top 82%", end: "bottom 48%", scrub: true },
      },
    );

    // Cada problema ganha foco quando chega ao centro da tela.
    gsap.utils.toArray<HTMLElement>(".problem-row").forEach((row) => {
      gsap.fromTo(
        row,
        { opacity: 0.2, x: desktop ? -28 : 0 },
        {
          opacity: 1,
          x: 0,
          ease: "none",
          scrollTrigger: { trigger: row, start: "top 88%", end: "top 55%", scrub: true },
        },
      );
    });
  });

  return (
    <section ref={root} className="relative py-28 lg:py-44" aria-labelledby="problema">
      <div className="container-x">
        <h2
          id="problema"
          className="problem-statement h-display max-w-4xl text-[clamp(2.25rem,5.6vw,4.5rem)]"
        >
          {STATEMENT.map((w, i) => (
            <span key={i} className="problem-word inline-block">
              {w}
              {i < STATEMENT.length - 1 ? "\u00A0" : ""}
            </span>
          ))}
        </h2>

        <div className="mt-16 lg:mt-24">
          {PROBLEMS.map((p) => (
            <div
              key={p.title}
              className="problem-row grid gap-x-10 gap-y-2 border-t border-line py-7 last:border-b md:grid-cols-[1.1fr_1fr] md:items-baseline lg:py-9"
            >
              <h3 className="h-display text-2xl lg:text-[2rem]">{p.title}</h3>
              <p className="max-w-md text-[16px] leading-relaxed text-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
