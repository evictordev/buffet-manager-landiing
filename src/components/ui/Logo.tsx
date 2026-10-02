import { ChefHat } from "lucide-react";

export default function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <a href="#top" className="flex items-center gap-2.5" aria-label="Buffet Manager, início">
      <span
        className={`grid h-9 w-9 place-items-center rounded-full ${
          "bg-white text-night"
        }`}
      >
        <ChefHat className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <span className={`text-[17px] font-semibold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        Buffet Manager
      </span>
    </a>
  );
}
