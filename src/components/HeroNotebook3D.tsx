import { useEffect, useRef, useState } from "react";
import { NotebookScene } from "./three/notebookScene";
import { shots, notebookMockup } from "../assets";

/**
 * Notebook 3D (Three.js) que gira e abre revelando o painel do Buffet Manager.
 * Cai para a captura estática caso WebGL não esteja disponível.
 */
export default function HeroNotebook3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) {
      setWebglSupported(false);
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new NotebookScene({
      container,
      screenTextureUrl: shots.dashboard.src,
      screenAspect: shots.dashboard.width / shots.dashboard.height,
      reducedMotion,
    });

    return () => scene.dispose();
  }, []);

  if (!webglSupported) {
    return (
      <img
        src={notebookMockup.src}
        width={notebookMockup.width}
        height={notebookMockup.height}
        alt={notebookMockup.alt}
        fetchPriority="high"
        decoding="async"
        className="mx-auto h-auto w-full max-w-[760px] drop-shadow-[0_28px_45px_rgba(0,0,0,0.32)] lg:w-full xl:w-[140%] xl:translate-x-[5%] lg:max-w-none"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={notebookMockup.alt}
      className="relative mx-auto aspect-[1188/665] w-full max-w-[760px] drop-shadow-[0_28px_45px_rgba(0,0,0,0.32)] lg:w-full xl:w-[140%] xl:translate-x-[5%] lg:max-w-none"
    />
  );
}
