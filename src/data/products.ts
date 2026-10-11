import { getSpec } from "@/lib/art";
import type { CategoryId, DurationOption, Product } from "@/types/workspace";

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "desks", label: "Desks" },
  { id: "chairs", label: "Chairs" },
  { id: "monitors", label: "Monitors" },
  { id: "accessories", label: "Accessories" },
  { id: "lighting", label: "Lighting" },
  { id: "plants", label: "Plants & décor" },
];

// Duration pricing is data, not scattered logic. All rates are demo estimates.
export const DURATION_OPTIONS: DurationOption[] = [
  { id: "1w", label: "1 week", short: "1 wk", weeks: 1, multiplier: 1 },
  { id: "2w", label: "2 weeks", short: "2 wks", weeks: 2, multiplier: 0.95, note: "5% off the weekly rate" },
  { id: "1m", label: "1 month", short: "1 mo", weeks: 4, multiplier: 0.88, note: "12% off the weekly rate" },
  { id: "3m", label: "3 months", short: "3 mos", weeks: 12, multiplier: 0.75, note: "25% off — best value" },
];

const dims = (id: string) => {
  const s = getSpec(id);
  return { w: s.w, d: s.d, h: s.h };
};

export const PRODUCTS: Product[] = [
  { id: "desk-wood", name: "Ara Wood Desk", category: "desks", descriptor: "Solid rubberwood · 140 × 70 cm",
    description: "A calm, warm workhorse of a desk with a solid rubberwood top and black steel legs. The everyday favourite.",
    weeklyRate: 145000, size: dims("desk-wood"), defaultPos: { x: 240, y: 108, rotation: 0 } },
  { id: "desk-standing", name: "Lift Standing Desk", category: "desks", descriptor: "Electric sit-stand · 160 × 75 cm",
    description: "Whisper-quiet electric frame with memory presets. Morning coffee seated, afternoon deep work standing.",
    weeklyRate: 320000, size: dims("desk-standing"), defaultPos: { x: 240, y: 110, rotation: 0 } },
  { id: "desk-compact", name: "Nusa Compact Desk", category: "desks", descriptor: "Apartment-friendly · 100 × 55 cm",
    description: "Small footprint, full working surface. Made for studio apartments where every centimetre must earn its keep.",
    weeklyRate: 95000, size: dims("desk-compact"), defaultPos: { x: 240, y: 110, rotation: 0 } },
  { id: "chair-mesh", name: "Citra Mesh Chair", category: "chairs", descriptor: "Breathable mesh · adjustable lumbar",
    description: "A supportive task chair that stays cool through humid afternoons. Adjustable lumbar pad, arms and seat depth.",
    weeklyRate: 120000, size: dims("chair-mesh"), defaultPos: { x: 240, y: 200, rotation: 0 } },
  { id: "chair-premium", name: "Padma Ergonomic Chair", category: "chairs", descriptor: "Premium ergonomic · headrest + 4D arms",
    description: "The chair people ask about on calls. Headrest, 4D armrests, tilt lock and a seat that disappears under you.",
    weeklyRate: 210000, size: dims("chair-premium"), defaultPos: { x: 240, y: 204, rotation: 0 } },
  { id: "monitor-single", name: "Solo 27″ Monitor", category: "monitors", descriptor: "27-inch QHD · slim foot",
    description: "A crisp 27-inch QHD panel on a slim, low-profile foot. Enough screen for everything that matters.",
    weeklyRate: 110000, size: dims("monitor-single"), defaultPos: { x: 240, y: 88, rotation: 0 } },
  { id: "monitor-ultra", name: "Panorama Ultrawide", category: "monitors", descriptor: "34-inch curved ultrawide",
    description: "One sweeping curved screen instead of two. Timeline on the left, references on the right, inbox in exile.",
    weeklyRate: 185000, size: dims("monitor-ultra"), defaultPos: { x: 240, y: 92, rotation: 0 } },
  { id: "monitor-dual", name: "Twin Monitor Bundle", category: "monitors", descriptor: "Two 24-inch screens · shared rail",
    description: "A matched pair of 24-inch screens on a shared rail. The classic founder dashboard.",
    weeklyRate: 195000, size: dims("monitor-dual"), defaultPos: { x: 240, y: 90, rotation: 0 } },
  { id: "acc-laptop-stand", name: "Riser Laptop Stand", category: "accessories", descriptor: "Aluminium riser · folds flat",
    description: "Lifts any laptop to eye level and folds flat into a drawer. Pairs perfectly with an external keyboard.",
    weeklyRate: 25000, size: dims("acc-laptop-stand"), defaultPos: { x: 204, y: 106, rotation: 0 } },
  { id: "acc-keyboard", name: "Laut Keyboard + Mouse", category: "accessories", descriptor: "Low-profile wireless combo",
    description: "A quiet, low-profile wireless set with a palm-friendly mouse. Batteries outlast most projects.",
    weeklyRate: 35000, size: dims("acc-keyboard"), defaultPos: { x: 240, y: 132, rotation: 0 } },
  { id: "acc-headphones", name: "Telus Headphones", category: "accessories", descriptor: "Closed-back · noise isolating",
    description: "Closed-back cans that keep café chaos out and focus in. Comfortable through long sessions.",
    weeklyRate: 45000, size: dims("acc-headphones"), defaultPos: { x: 298, y: 122, rotation: 0 } },
  { id: "acc-monitor-arm", name: "Svayu Monitor Arm", category: "accessories", descriptor: "Gas-spring mount · single arm",
    description: "Floats your monitor above the desk and frees the surface underneath. Cable routing included.",
    weeklyRate: 40000, size: dims("acc-monitor-arm"), defaultPos: { x: 210, y: 94, rotation: 0 } },
  { id: "acc-organizer", name: "Rakit Desk Organizer", category: "accessories", descriptor: "Bamboo tray · four compartments",
    description: "A bamboo catch-all for pens, cables and the things that otherwise colonise your desk.",
    weeklyRate: 18000, size: dims("acc-organizer"), defaultPos: { x: 182, y: 106, rotation: 0 } },
  { id: "acc-footrest", name: "Sela Footrest", category: "accessories", descriptor: "Adjustable angle · ribbed top",
    description: "A quietly life-changing wedge that tilts to taste. Your lower back will send a thank-you note.",
    weeklyRate: 22000, size: dims("acc-footrest"), defaultPos: { x: 240, y: 284, rotation: 0 } },
  { id: "light-lamp", name: "Cahaya Desk Lamp", category: "lighting", descriptor: "Warm LED · three temperatures",
    description: "An articulated lamp with three colour temperatures, from golden hour to clinical focus.",
    weeklyRate: 30000, size: dims("light-lamp"), defaultPos: { x: 306, y: 90, rotation: 0 } },
  { id: "plant-monsoon", name: "Monsoon Desk Plant", category: "plants", descriptor: "Live pothos · self-watering pot",
    description: "A low-maintenance pothos in a self-watering pot. Thrives on neglect, forgives long weekends.",
    weeklyRate: 15000, size: dims("plant-monsoon"), defaultPos: { x: 414, y: 64, rotation: 0 } },
];