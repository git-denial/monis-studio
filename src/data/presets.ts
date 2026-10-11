import type { PlanItem, Preset } from "@/types/workspace";

export const PRESETS: Preset[] = [
  {
    id: "minimalist", name: "The Minimalist", tagline: "Less, but better", duration: "1m",
    description: "A clean wooden desk, one good monitor, a supportive mesh chair and a plant that forgives everything. For focused solo work.",
    items: [
      { productId: "desk-wood", x: 240, y: 108, rotation: 0 },
      { productId: "monitor-single", x: 240, y: 88, rotation: 0 },
      { productId: "chair-mesh", x: 240, y: 196, rotation: 0 },
      { productId: "plant-monsoon", x: 414, y: 64, rotation: 0 },
    ],
  },
  {
    id: "creator", name: "The Creator", tagline: "Room to make", duration: "1m",
    description: "A spacious standing desk, twin monitors, a proper lamp and a wireless combo. Built for long making sessions.",
    items: [
      { productId: "desk-standing", x: 240, y: 110, rotation: 0 },
      { productId: "monitor-dual", x: 240, y: 90, rotation: 0 },
      { productId: "chair-mesh", x: 240, y: 202, rotation: 0 },
      { productId: "light-lamp", x: 308, y: 88, rotation: 0 },
      { productId: "acc-keyboard", x: 240, y: 132, rotation: 0 },
    ],
  },
  {
    id: "founder", name: "The Founder", tagline: "Command ready", duration: "3m",
    description: "A professional standing desk, dual screens, a premium chair and accessories that make long days easier. Ready on day one.",
    items: [
      { productId: "desk-standing", x: 240, y: 110, rotation: 0 },
      { productId: "monitor-dual", x: 240, y: 88, rotation: 0 },
      { productId: "chair-premium", x: 240, y: 204, rotation: 0 },
      { productId: "acc-organizer", x: 182, y: 112, rotation: 0 },
      { productId: "acc-headphones", x: 300, y: 126, rotation: 0 },
      { productId: "light-lamp", x: 309, y: 88, rotation: 0 },
      { productId: "plant-monsoon", x: 414, y: 64, rotation: 0 },
    ],
  },
  {
    id: "scratch", name: "Start from Scratch", tagline: "A blank studio", duration: "1m",
    description: "An empty room with good light. Pick your first piece from the catalog and take it from there.",
    items: [],
  },
];

// The hero composition on the landing page — priced honestly from the same catalog.
export const HERO_PLAN: PlanItem[] = [
  { productId: "desk-standing", x: 240, y: 112, rotation: 0 },
  { productId: "monitor-ultra", x: 240, y: 92, rotation: 0 },
  { productId: "acc-organizer", x: 178, y: 118, rotation: 0 },
  { productId: "acc-keyboard", x: 240, y: 134, rotation: 0 },
  { productId: "acc-headphones", x: 300, y: 122, rotation: 0 },
  { productId: "light-lamp", x: 307, y: 88, rotation: 0 },
  { productId: "plant-monsoon", x: 414, y: 64, rotation: 0 },
  { productId: "chair-mesh", x: 240, y: 198, rotation: 0 },
  { productId: "acc-footrest", x: 240, y: 284, rotation: 0 },
];