export type CategoryId = "desks" | "chairs" | "monitors" | "accessories" | "lighting" | "plants";

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  descriptor: string;
  description: string;
  weeklyRate: number; // IDR per week — demo estimate
  size: { w: number; d: number; h: number }; // footprint (cm) + height
  defaultPos: { x: number; y: number; rotation: number };
}

export type DurationId = "1w" | "2w" | "1m" | "3m";

export interface DurationOption {
  id: DurationId;
  label: string;
  short: string;
  weeks: number;
  multiplier: number; // configurable duration discount
  note?: string;
}

export interface PlanItem { productId: string; x: number; y: number; rotation: number; }

export interface WorkspaceItem extends PlanItem { uid: string; }

export interface Preset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  duration: DurationId;
  items: PlanItem[];
}

export interface PriceLine { product: Product; qty: number; weekly: number; total: number; }

export interface PriceSummary {
  lines: PriceLine[];
  weeklySubtotal: number;
  weeks: number;
  multiplier: number;
  discount: number;
  total: number;
}