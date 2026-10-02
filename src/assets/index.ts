import notebook from "./notebook.webp";
import login from "./login.webp";
import dashboard from "./dashboard-perdas.webp";
import utensilios from "./utensilios.webp";

export type Shot = { src: string; width: number; height: number; alt: string };

/** Screenshots reais do Buffet Manager (1916 × 1116). */
export const shots = {
  login: { src: login, width: 1916, height: 1116, alt: "Tela de acesso do Buffet Manager" },
  dashboard: {
    src: dashboard,
    width: 1916,
    height: 1116,
    alt: "Painel de utensílios e perdas do Buffet Manager, com indicadores e notificações",
  },
  utensilios: {
    src: utensilios,
    width: 1916,
    height: 1116,
    alt: "Tela de gestão de utensílios do Buffet Manager, com indicadores e tabela de inventário",
  },
} satisfies Record<string, Shot>;

export type Crop = { x: number; y: number; w: number; h: number };

/**
 * Recortes (em pixels da imagem original) usados como detalhes flutuantes.
 * Nenhuma informação é alterada: é apenas um enquadramento da tela real.
 */
export const crops = {
  // Tela de utensílios
  utKpiTotal: { x: 338, y: 110, w: 483, h: 158 },
  utKpiEstoque: { x: 839, y: 110, w: 483, h: 158 },
  utSidebar: { x: 0, y: 56, w: 256, h: 690 },
  utTable: { x: 361, y: 330, w: 1440, h: 415 },
  utToolbarArea: { x: 830, y: 100, w: 1000, h: 650 },
  // Tela de perdas
  dashKpis: { x: 363, y: 187, w: 1020, h: 191 },
  dashNotifications: { x: 1572, y: 56, w: 316, h: 393 },
} satisfies Record<string, Crop>;

/** Notebook com o painel do sistema, recortado sem fundo (1188 × 665). */
export const notebookMockup = {
  src: notebook,
  width: 1188,
  height: 665,
  alt: "Notebook exibindo o painel de utensílios e perdas do Buffet Manager",
};
