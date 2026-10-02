# Buffet Manager — Landing Page

React + TypeScript + Vite + Tailwind CSS 3 + GSAP (ScrollTrigger e ScrollToPlugin).

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # build de produção (dist/)
npm run preview  # serve o build
```

## Onde editar

- `src/config.ts` — destino do botão final (`CTA_URL`) e links do menu.
- `src/assets/` — screenshots (webp). Para trocar uma imagem, substitua o arquivo mantendo o nome.
- `src/assets/index.ts` — dimensões dos screenshots e os **recortes** (`crops`) usados nos detalhes flutuantes.
- `src/components/*` — uma seção por arquivo. As animações ficam no próprio componente.
- `tailwind.config.js` — paleta e fontes (Geist em todo o site, igual à logo).

## Animações

- `src/lib/gsap.ts` registra os plugins uma única vez.
- `src/hooks/useScrollAnimations.ts` usa `gsap.matchMedia()` com escopo no componente:
  - **desktop (>= 1024px):** pin, scrub, parallax, movimentos laterais.
  - **mobile (< 1024px):** movimentos curtos e verticais, sem pin.
  - **prefers-reduced-motion:** nenhuma animação é criada; o conteúdo fica estático e visível.
- Cleanup automático (`mm.revert()`) ao desmontar, incluindo ScrollTriggers e pin-spacers.
- Âncoras (`#id`) rolam via ScrollToPlugin, que respeita os espaçadores do pin.
- A seção "Veja o Buffet Manager por dentro" (`ProductShowcase.tsx`) é a principal: pin + scrub com zoom nas telas.
