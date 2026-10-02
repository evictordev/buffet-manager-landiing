import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "../lib/gsap";

export type MotionMode = "desktop" | "mobile";

/**
 * Cria animações dentro de um gsap.matchMedia() com escopo no componente.
 *
 * - desktop: >= 1024px (pin, parallax, scrub, composições maiores)
 * - mobile:  < 1024px (movimentos curtos e verticais, sem pin)
 * - prefers-reduced-motion: reduce -> nenhuma animação é criada e o
 *   conteúdo permanece estático e totalmente visível.
 *
 * Tudo que é criado aqui (tweens, timelines, ScrollTriggers, pin-spacers)
 * é revertido automaticamente no unmount ou quando a media query muda.
 */
export function useScrollAnimations(
  scope: RefObject<HTMLElement | null>,
  build: (mode: MotionMode) => void,
) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(scope.current ?? undefined);

    mm.add(
      {
        desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean; mobile: boolean };
        build(desktop ? "desktop" : "mobile");
      },
    );

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
