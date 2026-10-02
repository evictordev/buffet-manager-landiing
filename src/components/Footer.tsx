import { NAV_LINKS } from "../config";
import Logo from "./ui/Logo";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="container-x flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 text-[14px] text-muted">Gerencie seus eventos com excelência.</p>
        </div>
        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-8 gap-y-3">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-[14px] text-muted transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="container-x border-t border-line py-6 text-[13px] text-muted">
        © {new Date().getFullYear()} Buffet Manager. Todos os direitos reservados.
      </div>
    </footer>
  );
}
