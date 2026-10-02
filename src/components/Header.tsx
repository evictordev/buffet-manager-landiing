import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { NAV_LINKS } from "../config";
import Logo from "./ui/Logo";
import Button from "./ui/Button";

export default function Header() {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const barTop = useRef<HTMLSpanElement>(null);
  const barBottom = useRef<HTMLSpanElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const firstRun = useRef(true);

  // Fundo, blur e sombra ao rolar (um único ScrollTrigger).
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: "top -24",
        end: "max",
        onToggle: (self) => setScrolled(self.isActive),
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // Estado inicial do menu mobile (fechado).
  useLayoutEffect(() => {
    gsap.set(panel.current, { autoAlpha: 0, y: -12 });
  }, []);

  // Animação do hambúrguer + painel.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = reduce ? 0 : 0.35;
    const ctx = gsap.context(() => {
      gsap.to(barTop.current, { y: open ? 0 : -4, rotate: open ? 45 : 0, duration: d, ease: "power3.out" });
      gsap.to(barBottom.current, { y: open ? 0 : 4, rotate: open ? -45 : 0, duration: d, ease: "power3.out" });
      gsap.to(panel.current, {
        autoAlpha: open ? 1 : 0,
        y: open ? 0 : -12,
        duration: d,
        ease: "power3.out",
      });
      if (open && !reduce) {
        gsap.from(".menu-item", { y: 14, opacity: 0, stagger: 0.06, duration: 0.45, delay: 0.08, ease: "power3.out" });
      }
    }, root);
    return () => ctx.revert();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const bg = scrolled || open
    ? "bg-paper/80 shadow-[0_1px_0_rgba(255,255,255,0.08),0_12px_30px_-24px_rgba(0,0,0,0.6)] backdrop-blur-md"
    : "bg-transparent";

  return (
    <header
      ref={root}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${bg}`}
    >
      <div className="container-x flex h-[68px] items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Principal">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] text-muted transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href="#como-funciona" className="!px-5 !py-2.5">
            Conhecer o sistema
          </Button>
        </div>

        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-lg lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          <span ref={barTop} className="absolute h-[2px] w-5 rounded bg-ink" style={{ transform: "translateY(-4px)" }} />
          <span ref={barBottom} className="absolute h-[2px] w-5 rounded bg-ink" style={{ transform: "translateY(4px)" }} />
        </button>
      </div>

      <div id="menu-mobile" ref={panel} className="absolute inset-x-0 top-full border-t border-line bg-paper/95 px-6 pb-6 pt-3 shadow-[0_24px_40px_-30px_rgba(0,0,0,0.6)] backdrop-blur-md lg:hidden">
        <nav className="flex flex-col" aria-label="Menu mobile">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="menu-item border-b border-line py-4 text-lg text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="menu-item mt-5">
          <Button href="#como-funciona" className="w-full">
            Conhecer o sistema
          </Button>
        </div>
      </div>
    </header>
  );
}
