import type { PlanItem } from "@/types/workspace";

export const ROOM_W = 480; // cm
export const ROOM_H = 340;

export interface Art { w: number; h: number; svg: string }

const P = {
  wood: "#C9A46E", woodD: "#A87F4F", woodEdge: "#8F6B41",
  ink: "#3A342C", inkL: "#5A5348",
  sage: "#9DAF87", sageD: "#6E8259",
  metal: "#A9A296", metalD: "#807868",
  cream: "#F1E9D8", line: "#D8CDB8",
  terra: "#D97E4A", glow: "#F3D9A4",
};

// Rasterize at 2x natural size so zooming stays crisp.
const S = 2;
const wrap = (w: number, h: number, inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w * S}" height="${h * S}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;

function desk(w: number, h: number, extra = ""): Art {
  let grain = "";
  for (let i = 1; i <= 4; i++) {
    const y = (h / 5) * i + 3;
    const x1 = 8 + ((i * 17) % 14);
    const x2 = w - 8 - ((i * 11) % 18);
    grain += `<path d="M ${x1} ${y} C ${x1 + (x2 - x1) * 0.3} ${y - 2}, ${x1 + (x2 - x1) * 0.7} ${y + 2}, ${x2} ${y}" stroke="${P.woodD}" stroke-width="1" fill="none" opacity="0.4"/>`;
  }
  return { w, h, svg: wrap(w, h, `
    <rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="7" fill="${P.wood}" stroke="${P.woodEdge}" stroke-width="2"/>
    ${grain}${extra}`) };
}

function monitorArt(w: number, footW: number): Art {
  return { w, h: 20, svg: wrap(w, 20, `
    <rect x="1" y="1.5" width="${w - 2}" height="9" rx="3.5" fill="${P.ink}"/>
    <rect x="3" y="3.5" width="${w - 6}" height="5" rx="1.5" fill="${P.inkL}"/>
    <line x1="5" y1="6" x2="${w - 5}" y2="6" stroke="#6E675B" stroke-width="1"/>
    <rect x="${w / 2 - 4}" y="10" width="8" height="4" fill="${P.metalD}"/>
    <rect x="${w / 2 - footW / 2}" y="14" width="${footW}" height="4.5" rx="2" fill="${P.metal}"/>`) };
}

function ultrawide(): Art {
  const w = 105;
  return { w, h: 22, svg: wrap(w, 22, `
    <path d="M2 8 Q ${w / 2} 2 ${w - 2} 8 L ${w - 2} 13 Q ${w / 2} 7 2 13 Z" fill="${P.ink}"/>
    <path d="M5 9.5 Q ${w / 2} 4.5 ${w - 5} 9.5 L ${w - 5} 11.5 Q ${w / 2} 6.5 5 11.5 Z" fill="${P.inkL}"/>
    <rect x="${w / 2 - 4}" y="12.5" width="8" height="4" fill="${P.metalD}"/>
    <rect x="${w / 2 - 15}" y="16.5" width="30" height="4.5" rx="2" fill="${P.metal}"/>`) };
}

function monitorDual(): Art {
  const one = (dx: number) => `
    <rect x="${1 + dx}" y="2" width="54" height="9" rx="3.5" fill="${P.ink}"/>
    <rect x="${3 + dx}" y="4" width="50" height="5" rx="1.5" fill="${P.inkL}"/>
    <rect x="${24 + dx}" y="11" width="8" height="4" fill="${P.metalD}"/>
    <rect x="${18 + dx}" y="15" width="20" height="4.5" rx="2" fill="${P.metal}"/>`;
  return { w: 118, h: 24, svg: wrap(118, 24, one(0) + one(62)) };
}

function chairArt(w: number, premium: boolean): Art {
  const c = w / 2;
  const R = w / 2 - 5;
  let spokes = "";
  for (let i = 0; i < 5; i++) {
    const a = ((i * 72 - 90) * Math.PI) / 180;
    const x = (c + Math.cos(a) * R).toFixed(1);
    const y = (c + Math.sin(a) * R).toFixed(1);
    spokes += `<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="${P.metalD}" stroke-width="2.6" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="3.4" fill="${P.inkL}"/>`;
  }
  const bw = premium ? 46 : 44;
  const fill = premium ? "#33302A" : P.ink;
  const detail = premium
    ? `<rect x="${c - bw / 2}" y="3" width="${bw}" height="13" rx="6.5" fill="none" stroke="${P.sage}" stroke-width="1.4" opacity="0.9"/><line x1="${c}" y1="5" x2="${c}" y2="14" stroke="${P.inkL}" stroke-width="1.2"/>`
    : `<line x1="${c - 14}" y1="9.5" x2="${c + 14}" y2="9.5" stroke="${P.inkL}" stroke-width="1.4"/><line x1="${c - 14}" y1="12.5" x2="${c + 14}" y2="12.5" stroke="${P.inkL}" stroke-width="1.4"/>`;
  return { w, h: w, svg: wrap(w, w, `${spokes}
    <circle cx="${c}" cy="${c}" r="5" fill="${P.metalD}"/>
    <rect x="${c - 20}" y="${c - 12}" width="40" height="${w - c - 2}" rx="10" fill="${fill}"/>
    <rect x="${c - bw / 2}" y="3" width="${bw}" height="13" rx="6.5" fill="${fill}"/>
    ${detail}`) };
}

function plantArt(): Art {
  let leaves = "";
  for (let i = 0; i < 5; i++) {
    leaves += `<ellipse cx="13" cy="13" rx="10.5" ry="4.6" fill="${i % 2 ? P.sage : P.sageD}" transform="rotate(${i * 72} 13 13)" opacity="0.95"/>`;
  }
  return { w: 26, h: 26, svg: wrap(26, 26, `
    <circle cx="13" cy="18.5" r="7" fill="${P.cream}" stroke="#78895F" stroke-width="1.6"/>
    ${leaves}<circle cx="13" cy="13" r="2.6" fill="#5A6B49"/>`) };
}

function keyboardArt(): Art {
  let keys = "";
  for (let r = 0; r < 3; r++) for (let c = 0; c < 11; c++) {
    keys += `<rect x="${(4 + c * 3.55).toFixed(1)}" y="${(5 + r * 4.4).toFixed(1)}" width="3" height="3.4" rx="0.7" fill="${P.line}"/>`;
  }
  return { w: 62, h: 22, svg: wrap(62, 22, `
    <rect x="1" y="3" width="44" height="16" rx="3" fill="${P.cream}" stroke="#C9BA9C" stroke-width="1.4"/>
    ${keys}
    <ellipse cx="53" cy="11" rx="6.5" ry="9" fill="${P.ink}"/>
    <line x1="53" y1="5" x2="53" y2="9" stroke="${P.sage}" stroke-width="1.2"/>`) };
}

const BUILDERS: Record<string, () => Art> = {
  "desk-wood": () => desk(140, 70),
  "desk-standing": () => desk(160, 75, `
    <rect x="8" y="8" width="144" height="59" rx="5" fill="none" stroke="${P.woodD}" stroke-width="1" stroke-dasharray="2 6" opacity="0.6"/>
    <circle cx="142" cy="37.5" r="4.5" fill="${P.terra}"/><circle cx="142" cy="37.5" r="1.5" fill="#FBF7EE"/>`),
  "desk-compact": () => desk(100, 55),
  "chair-mesh": () => chairArt(66, false),
  "chair-premium": () => chairArt(70, true),
  "monitor-single": () => monitorArt(62, 22),
  "monitor-ultra": () => ultrawide(),
  "monitor-dual": () => monitorDual(),
  "acc-laptop-stand": () => ({ w: 30, h: 26, svg: wrap(30, 26, `
    <rect x="2" y="2.5" width="26" height="16" rx="2" fill="${P.ink}"/>
    <rect x="4.5" y="4.5" width="21" height="6.5" rx="1" fill="${P.inkL}"/>
    <rect x="4.5" y="12.5" width="21" height="4" rx="1" fill="#6E675B"/>
    <path d="M8 18.5 h14 l3.5 5.5 h-21 z" fill="${P.metal}"/>`) }),
  "acc-keyboard": () => keyboardArt(),
  "acc-headphones": () => ({ w: 22, h: 22, svg: wrap(22, 22, `
    <path d="M4.5 14.5 A 7 7 0 0 1 17.5 14.5" stroke="${P.ink}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <circle cx="4.5" cy="16" r="4.6" fill="${P.ink}"/><circle cx="17.5" cy="16" r="4.6" fill="${P.ink}"/>
    <circle cx="4.5" cy="16" r="1.9" fill="${P.sage}"/><circle cx="17.5" cy="16" r="1.9" fill="${P.sage}"/>`) }),
  "acc-monitor-arm": () => ({ w: 16, h: 34, svg: wrap(16, 34, `
    <rect x="3.5" y="27.5" width="9" height="5.5" rx="2" fill="${P.metal}"/>
    <circle cx="8" cy="27" r="3.2" fill="${P.metalD}"/>
    <path d="M8 27 L8 12 L13.5 6.5" stroke="${P.metalD}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="13.5" cy="6.5" r="2.8" fill="${P.ink}"/>`) }),
  "acc-organizer": () => ({ w: 36, h: 20, svg: wrap(36, 20, `
    <rect x="1" y="1" width="34" height="18" rx="3" fill="${P.cream}" stroke="#C9BA9C" stroke-width="1.6"/>
    <line x1="12.5" y1="2.5" x2="12.5" y2="17.5" stroke="#C9BA9C" stroke-width="1.2"/>
    <line x1="24" y1="2.5" x2="24" y2="17.5" stroke="#C9BA9C" stroke-width="1.2"/>
    <line x1="4.5" y1="6" x2="10" y2="14.5" stroke="${P.terra}" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="27" y="5.5" width="6" height="9" rx="1" fill="${P.sage}"/>`) }),
  "acc-footrest": () => ({ w: 46, h: 30, svg: wrap(46, 30, `
    <rect x="1" y="1" width="44" height="28" rx="9" fill="#DACDB2" stroke="#78895F" stroke-width="1.6"/>
    <path d="M7 9 H39 M7 15 H39 M7 21 H39" stroke="#C4B695" stroke-width="2" stroke-linecap="round"/>`) }),
  "light-lamp": () => ({ w: 20, h: 28, svg: wrap(20, 28, `
    <ellipse cx="13" cy="5" rx="6.5" ry="4" fill="${P.glow}" opacity="0.65"/>
    <path d="M10 21 L10 11 L15.5 6.5" stroke="${P.ink}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="11.5" y="1.5" width="9" height="5" rx="2.2" fill="${P.ink}" transform="rotate(-32 16 4)"/>
    <circle cx="10" cy="21.5" r="6.2" fill="${P.ink}"/><circle cx="10" cy="21.5" r="2" fill="${P.metal}"/>`) }),
  "plant-monsoon": () => plantArt(),
};

const cache: Record<string, Art> = {};

export function getArt(id: string): Art {
  if (!cache[id]) {
    cache[id] = BUILDERS[id]?.() ?? { w: 40, h: 40, svg: wrap(40, 40, `<rect x="2" y="2" width="36" height="36" rx="6" fill="${P.wood}" stroke="${P.woodEdge}" stroke-width="2"/>`) };
  }
  return cache[id];
}

export function artDataUri(id: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(getArt(id).svg)}`;
}

// --- The room (warm floor plan: window light, grid, door swing) ---

export function roomInner(w = ROOM_W, h = ROOM_H, grid = true): string {
  let g = "";
  if (grid) {
    for (let x = 40; x < w; x += 40) g += `<line x1="${x}" y1="6" x2="${x}" y2="${h - 6}" stroke="#E6DBC4" stroke-width="0.9"/>`;
    for (let y = 40; y < h; y += 40) g += `<line x1="6" y1="${y}" x2="${w - 6}" y2="${y}" stroke="#E6DBC4" stroke-width="0.9"/>`;
  }
  return `
    <rect x="0" y="0" width="${w}" height="${h}" rx="3" fill="#F3EBDA"/>
    ${g}
    <polygon points="150,6 290,6 318,148 208,148" fill="#FBF3DC" opacity="0.8"/>
    <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="2" fill="none" stroke="#3A342C" stroke-width="4"/>
    <rect x="470" y="238" width="14" height="58" fill="#F3EBDA"/>
    <line x1="472" y1="234" x2="484" y2="234" stroke="#3A342C" stroke-width="3"/>
    <line x1="472" y1="300" x2="484" y2="300" stroke="#3A342C" stroke-width="3"/>
    <path d="M 478 238 A 60 60 0 0 0 418 298" fill="none" stroke="#B9AF9B" stroke-width="1.4" stroke-dasharray="5 4"/>
    <line x1="478" y1="298" x2="418" y2="298" stroke="#B9AF9B" stroke-width="2.4"/>
    <rect x="148" y="0" width="144" height="6" fill="#F3EBDA"/>
    <line x1="150" y1="2" x2="290" y2="2" stroke="#9FB6B3" stroke-width="4"/>
    <line x1="196" y1="0" x2="196" y2="5" stroke="#7E9592" stroke-width="1.6"/>
    <line x1="243" y1="0" x2="243" y2="5" stroke="#7E9592" stroke-width="1.6"/>`;
}

export function roomDataUri(grid: boolean): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(wrap(ROOM_W, ROOM_H, roomInner(ROOM_W, ROOM_H, grid)))}`;
}

// --- Full plan renderer (presets, hero, review, confirmation) ---

export interface PlanDim { x: number; w: number; y: number; label: string }

export function planSvg(items: PlanItem[], dim?: PlanDim): string {
  const shadows = items.map((it) => {
    const a = getArt(it.productId);
    return `<ellipse cx="${it.x}" cy="${it.y + 3}" rx="${a.w * 0.42}" ry="${a.h * 0.42}" fill="rgba(58,52,44,0.10)"/>`;
  }).join("");
  const imgs = items.map((it) => {
    const a = getArt(it.productId);
    return `<image x="${it.x - a.w / 2}" y="${it.y - a.h / 2}" width="${a.w}" height="${a.h}" transform="rotate(${it.rotation} ${it.x} ${it.y})" href="${artDataUri(it.productId)}"/>`;
  }).join("");
  const d = dim ? `
    <line x1="${dim.x}" y1="${dim.y}" x2="${dim.x + dim.w}" y2="${dim.y}" stroke="#8B8271" stroke-width="1"/>
    <line x1="${dim.x}" y1="${dim.y - 4}" x2="${dim.x}" y2="${dim.y + 4}" stroke="#8B8271" stroke-width="1"/>
    <line x1="${dim.x + dim.w}" y1="${dim.y - 4}" x2="${dim.x + dim.w}" y2="${dim.y + 4}" stroke="#8B8271" stroke-width="1"/>
    <text x="${dim.x + dim.w / 2}" y="${dim.y - 5}" font-family="ui-monospace, 'SF Mono', Menlo, monospace" font-size="9" fill="#8B8271" text-anchor="middle" letter-spacing="0.5">${dim.label}</text>` : "";
  return wrap(ROOM_W, ROOM_H, roomInner() + shadows + imgs + d);
}

export const planDataUri = (items: PlanItem[], dim?: PlanDim) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(planSvg(items, dim))}`;