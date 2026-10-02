import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "light";

const base =
  "inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-[15px] font-medium " +
  "transition-[background-color,box-shadow,transform,border-color] duration-300 ease-out " +
  "hover:-translate-y-0.5 active:translate-y-0";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-night hover:bg-white hover:shadow-[0_14px_40px_-14px_rgba(255,255,255,0.35)]",
  secondary: "border border-white/15 bg-transparent text-ink hover:border-white/35 hover:bg-white/5",
  light: "bg-white text-night hover:shadow-[0_14px_40px_-14px_rgba(255,255,255,0.5)]",
};

type Props = {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

export default function Button({ href, variant = "primary", children, className = "" }: Props) {
  return (
    <a href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </a>
  );
}
