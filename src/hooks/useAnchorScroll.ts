import { useEffect } from "react";
import { gsap } from "../lib/gsap";

/**
 * Um único listener delegado para links internos (#id).
 * Usa o ScrollToPlugin do GSAP, que calcula a posição já considerando
 * os espaçadores criados pelo pin do ScrollTrigger.
 */
export function useAnchorScroll() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.to(window, {
        scrollTo: { y: target, offsetY: hash === "#como-funciona" ? 0 : 72, autoKill: true },
        duration: reduce ? 0 : 1.1,
        ease: "power3.inOut",
      });
      history.replaceState(null, "", hash);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}
