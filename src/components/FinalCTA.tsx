import { useRef } from "react";
import { gsap } from "../lib/gsap";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import { CTA_URL } from "../config";
import { shots } from "../assets";
import Button from "./ui/Button";

export default function FinalCTA() {
  const root = useRef<HTMLElement>(null);

  useScrollAnimations(root, (mode) => {
    const desktop = mode === "desktop";

    gsap.from(".cta-panel", {
      y: desktop ? 70 : 30,
      scale: desktop ? 0.95 : 0.98,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".cta-panel", start: "top 88%" },
    });

    gsap.from(".cta-content > *", {
      y: 22,
      opacity: 0,
      stagger: 0.12,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ".cta-panel", start: "top 70%" },
    });

    if (desktop) {
      // Parallax muito lento no screenshot de fundo
      gsap.fromTo(
        ".cta-bg",
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: ".cta-panel", start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }
  });

  return (
    <section ref={root} className="px-4 pb-6 sm:px-6 lg:px-10" aria-labelledby="cta-final">
      <div className="cta-panel relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] bg-night text-white">
        <div aria-hidden="true" className="absolute inset-0">
          <img
            src={shots.dashboard.src}
            alt=""
            width={shots.dashboard.width}
            height={shots.dashboard.height}
            loading="lazy"
            decoding="async"
            className="cta-bg h-full w-full scale-110 object-cover opacity-60 blur-md"
          />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(70% 80% at 50% 50%, rgba(6,6,28,0.45), rgba(6,6,28,0.88))" }}
          />
        </div>

        <div className="cta-content relative mx-auto flex max-w-3xl flex-col items-center px-6 py-28 text-center lg:py-40">
          <h2 id="cta-final" className="h-display text-[clamp(2.1rem,5vw,4rem)]">
            Pronto para simplificar a gestão do seu buffet?
          </h2>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-white/65">
            Conheça o Buffet Manager e veja como reunir a operação do seu negócio em um só lugar.
          </p>
          <div className="mt-10">
            <Button href={CTA_URL} variant="light">
              Conheça o Buffet Manager
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
