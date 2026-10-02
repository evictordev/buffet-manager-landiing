import type { ReactNode } from "react";
import type { Crop, Shot } from "../../assets";

/** Moldura de janela escura, no mesmo tom do sistema. */
export function BrowserFrame({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`overflow-hidden rounded-2xl border border-white/10 bg-night shadow-frame ${className}`}
    >
      <div className="flex h-8 items-center gap-1.5 border-b border-white/[0.06] bg-night-2 px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      </div>
      {children}
    </div>
  );
}

/** Screenshot inteiro, com dimensões explícitas para evitar layout shift. */
export function ShotImage({
  shot,
  eager = false,
  className = "",
}: {
  shot: Shot;
  eager?: boolean;
  className?: string;
}) {
  return (
    <img
      src={shot.src}
      alt={shot.alt}
      width={shot.width}
      height={shot.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      draggable={false}
      className={`block h-auto w-full select-none ${className}`}
    />
  );
}

/** Recorte de uma região de um screenshot (sem alterar o conteúdo). */
export function ScreenCrop({
  shot,
  crop,
  className = "",
}: {
  shot: Shot;
  crop: Crop;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-night ${className}`}
      style={{ aspectRatio: `${crop.w} / ${crop.h}` }}
    >
      <img
        src={shot.src}
        alt=""
        width={shot.width}
        height={shot.height}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute h-auto max-w-none select-none"
        style={{
          width: `${(shot.width / crop.w) * 100}%`,
          left: `${(-crop.x / crop.w) * 100}%`,
          top: `${(-crop.y / crop.h) * 100}%`,
        }}
      />
    </div>
  );
}
