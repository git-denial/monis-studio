// Isometric (2:1 dimetric) illustration engine.
// Products are drawn procedurally in local coordinates and rendered through a
// rotation-aware projection, so catalog thumbnails, the Konva canvas, presets,
// checkout and confirmation all share one consistent 2.5D look.

import type { PlanItem } from "@/types/workspace";

export const ROOM_W = 480; // floor size, cm
export const ROOM_H = 340;
export const WALL_H = 240;
export const SCENE_W = 860; // scene bounds (floor diamond + walls), projected units
export const SCENE_H = 720;
export const SCENE_OX = 360; // world (0,0,0) sits at this point in scene coordinates
export const SCENE_OY = 290;

/** 2:1 dimetric projection: floor position (x, y) + height z (up = negative screen y). */
export const project = (x: number, y: number, z = 0) => ({ x: x - y, y: (x + y) / 2 - z });

const P = {
  wood: "#C9A46E", woodD: "#A87F4F",
  ink: "#3A342C", inkL: "#5A5348",
  sage: "#9DAF87", sageD: "#6E8259",
  metal: "#A9A296", metalD: "#807868",
  cream: "#F1E9D8",
  terra: "#D97E4A", glow: "#F3D9A4",
  soil: "#6B5744",
  screen: "#454B3F", screenLit: "#77806B",
  charcoal: "#33302A",
  potEdge: "#78895F",
};

const num = (n: number) => (Math.round(n * 10) / 10).toString();
const pt = (x: number, y: number, z = 0) => `${num(x - y)},${num((x + y) / 2 - z)}`;

function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = f < 0 ? 0 : 255;
  const p = Math.min(1, Math.abs(f));
  const mix = (c: number) => Math.round(c + (t - c) * p);
  return "#" + ((1 << 24) + (mix(r) << 16) + (mix(g) << 8) + mix(b)).toString(16).slice(1);
}

// Local (u,v) -> world (x,y) for the four supported orientations.
const ROT: Array<(u: number, v: number) => [number, number]> = [
  (u, v) => [u, v],
  (u, v) => [-v, u],
  (u, v) => [-u, -v],
  (u, v) => [v, -u],
];
export const norm90 = (r: number) => (((Math.round(r / 90) * 90) % 360) + 360) % 360;

interface Ctx {
  w: (u: number, v: number) => [number, number];
  lp: (u: number, v: number, z?: number) => { x: number; y: number };
  pts: (pts: ReadonlyArray<[number, number, number?]>) => string;
  quad: (fill: string, pts: ReadonlyArray<[number, number, number?]>, stroke?: string, sw?: number) => string;
  pp: (p: { x: number; y: number }) => string;
}

const ctxFor = (rot: number): Ctx => {
  const m = ROT[norm90(rot) / 90];
  const w = (u: number, v: number): [number, number] => m(u, v);
  const lp = (u: number, v: number, z = 0) => {
    const [x, y] = m(u, v);
    return { x: x - y, y: (x + y) / 2 - z };
  };
  const pp = (p: { x: number; y: number }) => `${num(p.x)},${num(p.y)}`;
  const pts = (arr: ReadonlyArray<[number, number, number?]>) =>
    arr.map(([u, v, z]) => pp(lp(u, v, z ?? 0))).join(" ");
  const quad = (fill: string, arr: ReadonlyArray<[number, number, number?]>, stroke?: string, sw = 0.8) =>
    `<polygon points="${pts(arr)}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"` : ""}/>`;
  return { w, lp, pts, quad, pp };
};

// World-space box: top (+0.18), front-left +y face (base), right +x face (-0.2).
const wbox = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, base: string, topExtra = "") => {
  const edge = shade(base, -0.52);
  return (
    `<polygon points="${[pt(x1, y1, z1), pt(x0, y1, z1), pt(x0, y1, z0), pt(x1, y1, z0)].join(" ")}" fill="${base}" stroke="${edge}" stroke-width="0.7" stroke-linejoin="round"/>` +
    `<polygon points="${[pt(x1, y0, z1), pt(x1, y1, z1), pt(x1, y1, z0), pt(x1, y0, z0)].join(" ")}" fill="${shade(base, -0.2)}" stroke="${edge}" stroke-width="0.7" stroke-linejoin="round"/>` +
    `<polygon points="${[pt(x0, y0, z1), pt(x1, y0, z1), pt(x1, y1, z1), pt(x0, y1, z1)].join(" ")}" fill="${shade(base, 0.18)}" stroke="${edge}" stroke-width="0.8" stroke-linejoin="round"/>` +
    topExtra
  );
};

// Local box: maps the local rectangle through the rotation, then draws a world box.
const lbox = (c: Ctx, u0: number, u1: number, v0: number, v1: number, z0: number, z1: number, base: string, topExtra = "") => {
  const xs: number[] = [], ys: number[] = [];
  for (const u of [u0, u1]) for (const v of [v0, v1]) { const [x, y] = c.w(u, v); xs.push(x); ys.push(y); }
  return wbox(Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys), z0, z1, base, topExtra);
};

// Sampled cylinder (lamp base) — front side + top ellipse.
const cyl = (c: Ctx, u: number, v: number, r: number, z0: number, z1: number, base: string) => {
  const p = c.lp(u, v, 0);
  const rx = r * 1.4142, ry = r * 0.7071;
  const yb = p.y - z0, yt = p.y - z1;
  const bottom: string[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = Math.PI - (Math.PI * i) / 12;
    bottom.push(`${num(p.x + rx * Math.cos(t))},${num(yb + ry * Math.sin(t))}`);
  }
  const top = bottom.map((s) => {
    const [x, y] = s.split(",");
    return `${x},${num(Number(y) - (z1 - z0))}`;
  });
  const edge = shade(base, -0.52);
  return (
    `<polygon points="${[`${num(p.x - rx)},${num(yt)}`, `${num(p.x - rx)},${num(yb)}`, ...bottom, `${num(p.x + rx)},${num(yt)}`, ...top.reverse()].join(" ")}" fill="${base}" stroke="${edge}" stroke-width="0.7" stroke-linejoin="round"/>` +
    `<ellipse cx="${num(p.x)}" cy="${num(yt)}" rx="${num(rx)}" ry="${num(ry)}" fill="${shade(base, 0.18)}" stroke="${edge}" stroke-width="0.7"/>`
  );
};

const line = (c: Ctx, a: [number, number, number?], b: [number, number, number?], stroke: string, sw = 1) =>
  `<path d="M ${c.pp(c.lp(a[0], a[1], a[2] ?? 0))} L ${c.pp(c.lp(b[0], b[1], b[2] ?? 0))}" stroke="${stroke}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;

const dot = (c: Ctx, u: number, v: number, z: number, r: number, fill: string) => {
  const p = c.lp(u, v, z);
  return `<circle cx="${num(p.x)}" cy="${num(p.y)}" r="${r}" fill="${fill}"/>`;
};

interface Builder {
  w: number; d: number; h: number; // footprint (cm) + height
  surface?: number; // desk-top height — other items may rest on it
  stack?: boolean; // may be placed on a desk
  pad?: [number, number, number, number]; // extra sprite margins [l, t, r, b]
  draw: (c: Ctx) => string;
}

const BUILDERS: Record<string, Builder> = {
  "desk-wood": {
    w: 140, d: 70, h: 74, surface: 74,
    draw: (c) => {
      let legs = "";
      for (const [u, v] of [[-61, -28.5], [-61, 28.5], [61, -28.5], [61, 28.5]] as const) {
        legs += lbox(c, u - 3.5, u + 3.5, v - 3.5, v + 3.5, 0, 69, P.metalD);
      }
      const grain = [-21, -7, 7, 21].map((v) => line(c, [-62, v, 74.2], [62, v, 74.2], P.woodD, 1)).join("");
      return legs + lbox(c, -70, 70, -35, 35, 69, 74, P.wood, grain);
    },
  },
  "desk-standing": {
    w: 160, d: 75, h: 74, surface: 74,
    draw: (c) => {
      const feet = lbox(c, -56, -44, -32, 32, 0, 4, P.ink) + lbox(c, 44, 56, -32, 32, 0, 4, P.ink);
      const cols = lbox(c, -54, -46, -6, 6, 4, 70, P.metalD) + lbox(c, 46, 54, -6, 6, 4, 70, P.metalD);
      const grain = [-26, -13, 0, 13, 26].map((v) => line(c, [-74, v, 74.2], [74, v, 74.2], P.woodD, 1)).join("");
      const btn = dot(c, 71, -28, 74.3, 3.4, P.terra) + dot(c, 71, -28, 74.3, 1.2, "#FBF7EE");
      return feet + cols + lbox(c, -80, 80, -37.5, 37.5, 70, 74, P.wood, grain + btn);
    },
  },
  "desk-compact": {
    w: 100, d: 55, h: 74, surface: 74,
    draw: (c) => {
      let legs = "";
      for (const [u, v] of [[-41, -21.5], [-41, 21.5], [41, -21.5], [41, 21.5]] as const) {
        legs += lbox(c, u - 3, u + 3, v - 3, v + 3, 0, 69, P.metalD);
      }
      const grain = [-16, -5, 5, 16].map((v) => line(c, [-44, v, 74.2], [44, v, 74.2], P.woodD, 1)).join("");
      return legs + lbox(c, -50, 50, -27.5, 27.5, 69, 74, P.wood, grain);
    },
  },
  // Chairs face -v (toward the desk); backrest is on the near side, so from
  // the camera you see the chair's back in front of the desk — the classic iso shot.
  "chair-mesh": {
    w: 58, d: 58, h: 96,
    draw: (c) => {
      let base = "";
      for (let i = 0; i < 5; i++) {
        const a = ((i * 72 - 90) * Math.PI) / 180;
        const dx = Math.cos(a), dy = Math.sin(a);
        const px = -dy, py = dx;
        const wd = 3.4;
        base += c.quad(P.inkL, [
          [dx * 6 + px * wd, dy * 6 + py * wd, 2],
          [dx * 27 + px * wd, dy * 27 + py * wd, 2],
          [dx * 27 - px * wd, dy * 27 - py * wd, 2],
          [dx * 6 - px * wd, dy * 6 - py * wd, 2],
        ], shade(P.inkL, -0.5), 0.6);
        base += dot(c, dx * 28.5, dy * 28.5, 2.4, 2.6, P.ink);
      }
      const column = lbox(c, -3, 3, -3, 3, 1, 40, P.metalD);
      const seat = lbox(c, -23, 23, -21, 20, 41, 47, P.inkL) +
        c.quad("none", [[-19, -17, 47.2], [19, -17, 47.2], [19, 16, 47.2], [-19, 16, 47.2]], shade(P.inkL, -0.4), 0.7);
      const back = lbox(c, -22, 22, 20, 26, 50, 94, P.ink);
      const mesh = [58, 66, 74, 82].map((z) => line(c, [-17, 26.2, z], [17, 26.2, z], P.inkL, 1.1)).join("");
      return base + column + seat + back + mesh;
    },
  },
  "chair-premium": {
    w: 62, d: 62, h: 114,
    draw: (c) => {
      let base = "";
      for (let i = 0; i < 5; i++) {
        const a = ((i * 72 - 90) * Math.PI) / 180;
        const dx = Math.cos(a), dy = Math.sin(a);
        const px = -dy, py = dx;
        const wd = 3.6;
        base += c.quad(P.ink, [
          [dx * 6 + px * wd, dy * 6 + py * wd, 2],
          [dx * 28 + px * wd, dy * 28 + py * wd, 2],
          [dx * 28 - px * wd, dy * 28 - py * wd, 2],
          [dx * 6 - px * wd, dy * 6 - py * wd, 2],
        ], shade(P.ink, -0.5), 0.6);
        base += dot(c, dx * 29.5, dy * 29.5, 2.4, 2.8, P.charcoal);
      }
      const column = lbox(c, -3.5, 3.5, -3.5, 3.5, 1, 43, P.ink);
      const seat = lbox(c, -25, 25, -22, 21, 43, 50, P.charcoal) +
        line(c, [-20, 21.2, 46], [20, 21.2, 46], P.sage, 1.3);
      const back = lbox(c, -24, 24, 21, 27, 50, 102, P.charcoal);
      const detail =
        line(c, [-18, 27.2, 70], [18, 27.2, 70], P.sage, 1.3) +
        line(c, [-18, 27.2, 88], [18, 27.2, 88], P.sage, 1.3) +
        line(c, [0, 27.2, 54], [0, 27.2, 98], P.inkL, 1.2);
      const head = lbox(c, -12, 12, 21.5, 26.5, 102, 114, P.charcoal) +
        line(c, [-8, 26.7, 108], [8, 26.7, 108], P.sage, 1.2);
      return base + column + seat + back + detail + head;
    },
  },
  "monitor-single": {
    w: 62, d: 22, h: 40, stack: true,
    draw: (c) =>
      lbox(c, -20, 20, -11, 11, 0, 2.5, P.metal) +
      lbox(c, -3, 3, -3, 3, 2.5, 20, P.metalD) +
      lbox(c, -31, 31, -2, 2, 20, 40, P.ink) +
      c.quad(P.screen, [[-27, 2.2, 23], [27, 2.2, 23], [27, 2.2, 37], [-27, 2.2, 37]]) +
      line(c, [-20, 2.4, 30], [20, 2.4, 30], P.screenLit, 1.4) +
      dot(c, 26, 2.4, 21.6, 1.4, P.sage),
  },
  "monitor-ultra": {
    w: 105, d: 24, h: 52, stack: true,
    draw: (c) => {
      // Concave curved panel: sampled arc in plan, extruded vertically.
      const arc = (z: number, vOff = 0, uScale = 1): string[] => {
        const pts: string[] = [];
        for (let i = 0; i <= 20; i++) {
          const t = -1 + i / 10;
          pts.push(c.pp(c.lp(50 * uScale * t, -10 * (1 - t * t) * uScale + vOff, z)));
        }
        return pts;
      };
      const cap = c.quad(shade(P.ink, -0.2), [[50, 0, 50], [50, 0, 21], [50, -3, 21], [50, -3, 50]]);
      const front = `<polygon points="${[...arc(50), ...arc(21).reverse()].join(" ")}" fill="${P.ink}" stroke="${shade(P.ink, -0.4)}" stroke-width="0.7"/>`;
      const rim = `<polygon points="${[...arc(50), ...arc(50, -3).reverse()].join(" ")}" fill="${shade(P.ink, 0.14)}" stroke="${shade(P.ink, -0.4)}" stroke-width="0.6"/>`;
      const screen =
        `<polygon points="${[...arc(47, 1.6, 0.93), ...arc(24, 1.6, 0.93).reverse()].join(" ")}" fill="${P.screen}"/>` +
        `<path d="M ${arc(34, 1.8, 0.9).join(" L ")}" stroke="${P.screenLit}" stroke-width="1.3" fill="none"/>`;
      return lbox(c, -24, 24, -11, 11, 0, 3, P.metal) + lbox(c, -4, 4, -4, 4, 3, 21, P.metalD) + cap + front + rim + screen;
    },
  },
  "monitor-dual": {
    w: 118, d: 22, h: 50, stack: true,
    draw: (c) => {
      let out = lbox(c, -55, 55, -8, 8, 0, 3, P.metal);
      const lerpPt = (a: [number, number], b: [number, number], t: number): [number, number] =>
        [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      for (const side of [-1, 1] as const) {
        const cu = 31 * side;
        const th = ((-10 * side) * Math.PI) / 180; // panels angle toward the center seat
        const ex = Math.cos(th), ey = -Math.sin(th);
        const mA: [number, number] = [cu - 27 * ex, 1 - 27 * ey];
        const mB: [number, number] = [cu + 27 * ex, 1 + 27 * ey];
        out += lbox(c, cu - 3, cu + 3, -3, 3, 3, 20, P.metalD);
        out += c.quad(P.ink, [[mA[0], mA[1], 50], [mB[0], mB[1], 50], [mB[0], mB[1], 20], [mA[0], mA[1], 20]], shade(P.ink, -0.4), 0.7);
        const nx = Math.sin(th), ny = Math.cos(th);
        const sA: [number, number] = [cu - 23 * ex + 0.6 * nx, 1 - 23 * ey + 0.6 * ny];
        const sB: [number, number] = [cu + 23 * ex + 0.6 * nx, 1 + 23 * ey + 0.6 * ny];
        out += c.quad(P.screen, [[sA[0], sA[1], 47], [sB[0], sB[1], 47], [sB[0], sB[1], 24], [sA[0], sA[1], 24]]);
        const la = lerpPt(sA, sB, 0.2), lb = lerpPt(sA, sB, 0.8);
        out += line(c, [la[0], la[1], 34], [lb[0], lb[1], 34], P.screenLit, 1.3);
      }
      return out;
    },
  },
  "acc-laptop-stand": {
    w: 30, d: 26, h: 15, stack: true,
    draw: (c) => {
      const zv = (v: number) => 13 - ((v + 12) / 24) * 9.5;
      return (
        c.quad(P.metal, [[-14, 12, 3.5], [14, 12, 3.5], [14, 12, 0], [-14, 12, 0]], shade(P.metal, -0.5), 0.7) +
        c.quad(shade(P.metal, -0.2), [[14, -12, 13], [14, 12, 3.5], [14, 12, 0], [14, -12, 0]], shade(P.metal, -0.5), 0.7) +
        c.quad(shade(P.metal, 0.15), [[-14, -12, 13], [14, -12, 13], [14, 12, 3.5], [-14, 12, 3.5]], shade(P.metal, -0.5), 0.7) +
        c.quad(P.ink, [[-10, -8, zv(-8) + 0.4], [10, -8, zv(-8) + 0.4], [10, 8, zv(8) + 0.4], [-10, 8, zv(8) + 0.4]]) +
        line(c, [-10, -8, zv(-8) + 0.6], [10, -8, zv(-8) + 0.6], P.sage, 1.2)
      );
    },
  },
  "acc-keyboard": {
    w: 62, d: 22, h: 4.5, stack: true,
    draw: (c) => {
      let keys = "";
      for (let r = 0; r < 3; r++) {
        for (let k = 0; k < 11; k++) {
          const u0 = -28.5 + k * 3.7, v0 = -5.8 + r * 4;
          keys += c.quad("#E3D9C2", [[u0, v0, 2.5], [u0 + 2.9, v0, 2.5], [u0 + 2.9, v0 + 2.9, 2.5], [u0, v0 + 2.9, 2.5]]);
        }
      }
      return (
        lbox(c, -31, 13, -8, 8, 0, 2.4, P.cream) +
        keys +
        lbox(c, 19, 26, -5, 5, 0, 4, P.ink) +
        line(c, [21.5, 0, 4.2], [24, 0, 4.2], P.sage, 1.3)
      );
    },
  },
  "acc-headphones": {
    w: 26, d: 22, h: 8, stack: true,
    draw: (c) => {
      const band: string[] = [];
      for (let i = 0; i <= 10; i++) {
        const t = (Math.PI * i) / 10;
        band.push(c.pp(c.lp(-10 * Math.cos(t), 4 - 7 * Math.sin(t), 6.4)));
      }
      return (
        lbox(c, -13, -7, 1, 7, 0, 6, P.ink) +
        lbox(c, 7, 13, 1, 7, 0, 6, P.ink) +
        dot(c, -10, 4, 6.3, 1.8, P.sage) +
        dot(c, 10, 4, 6.3, 1.8, P.sage) +
        `<path d="M ${band.join(" L ")}" stroke="${P.ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
      );
    },
  },
  "acc-monitor-arm": {
    w: 26, d: 34, h: 33, stack: true,
    draw: (c) =>
      lbox(c, -7, 7, -17, 17, 0, 5, P.metal) +
      lbox(c, -2.5, 2.5, -2.5, 2.5, 5, 31, P.metalD) +
      lbox(c, 2.5, 21, -2, 2, 27, 30, P.metalD) +
      dot(c, 0, 0, 30, 2.6, P.ink) +
      lbox(c, 19, 24, -4.5, 4.5, 22, 28, P.ink),
  },
  "acc-organizer": {
    w: 36, d: 20, h: 8.6, stack: true,
    draw: (c) =>
      lbox(c, -18, 18, -10, 10, 0, 6, P.cream) +
      c.quad(shade(P.cream, -0.26), [[-15.5, -7.5, 5.8], [15.5, -7.5, 5.8], [15.5, 7.5, 5.8], [-15.5, 7.5, 5.8]]) +
      lbox(c, -4.4, -2.8, -7.5, 7.5, 5.8, 6.9, shade(P.cream, -0.08)) +
      lbox(c, 5.4, 7, -7.5, 7.5, 5.8, 6.9, shade(P.cream, -0.08)) +
      lbox(c, -15, -7, -5.5, -3, 6, 7, P.terra) +
      lbox(c, 10, 15.5, -5.5, 5.5, 6, 8.4, P.sage),
  },
  "acc-footrest": {
    w: 46, d: 30, h: 10,
    draw: (c) => {
      const zv = (v: number) => 5 + ((v + 15) / 30) * 5;
      let ribs = "";
      for (const v of [-9, -3, 3, 9]) {
        ribs += c.quad("#C9BAA0", [
          [-19, v - 1.6, zv(v - 1.6) + 0.3], [19, v - 1.6, zv(v - 1.6) + 0.3],
          [19, v + 1.6, zv(v + 1.6) + 0.3], [-19, v + 1.6, zv(v + 1.6) + 0.3],
        ]);
      }
      return (
        c.quad("#CFC1A4", [[-21, 15, zv(15)], [21, 15, zv(15)], [21, 15, 0], [-21, 15, 0]], P.potEdge, 0.9) +
        c.quad("#BFB093", [[21, -15, zv(-15)], [21, 15, zv(15)], [21, 15, 0], [21, -15, 0]], P.potEdge, 0.9) +
        c.quad("#DACDB2", [[-21, -15, zv(-15)], [21, -15, zv(-15)], [21, 15, zv(15)], [-21, 15, zv(15)]], P.potEdge, 0.9) +
        ribs
      );
    },
  },
  "light-lamp": {
    w: 24, d: 24, h: 36, stack: true, pad: [10, 8, 16, 6],
    draw: (c) => {
      const glow = `<polygon points="${c.pts([[5, 1, 21], [13, 1, 21], [20, 12, 1.5], [2, 12, 1.5]])}" fill="${P.glow}" opacity="0.4"/>`;
      return (
        glow +
        cyl(c, 0, 7, 8, 0, 3.5, P.ink) +
        `<path d="M ${c.pp(c.lp(0, 7, 3.5))} L ${c.pp(c.lp(0, -3, 32))} L ${c.pp(c.lp(9, 1, 26))}" stroke="${P.ink}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
        dot(c, 0, -3, 32, 2.2, P.ink) +
        dot(c, 9, 1, 26, 2.2, P.ink) +
        lbox(c, 6, 14, -1, 3.5, 22.5, 27.5, P.ink)
      );
    },
  },
  "plant-monsoon": {
    w: 26, d: 26, h: 52, stack: true,
    draw: (c) => {
      const pot =
        c.quad(P.cream, [[-9, 9, 16], [9, 9, 16], [7, 7, 0], [-7, 7, 0]], P.potEdge, 0.9) +
        c.quad(shade(P.cream, -0.16), [[9, -9, 16], [9, 9, 16], [7, 7, 0], [7, -7, 0]], P.potEdge, 0.9) +
        c.quad(shade(P.cream, 0.12), [[-9, -9, 16], [9, -9, 16], [9, 9, 16], [-9, 9, 16]], P.potEdge, 0.9);
      const soilP = c.lp(0, 0, 15);
      const soil = `<ellipse cx="${num(soilP.x)}" cy="${num(soilP.y)}" rx="${num(6 * 1.414)}" ry="${num(6 * 0.707)}" fill="${P.soil}"/>`;
      const leaves = [
        { a: 90, len: 17, hgt: 34, droop: false, fill: P.sage },
        { a: 30, len: 24, hgt: 28, droop: true, fill: P.sageD },
        { a: 150, len: 23, hgt: 27, droop: true, fill: P.sageD },
        { a: 270, len: 16, hgt: 33, droop: false, fill: P.sage },
        { a: 330, len: 25, hgt: 26, droop: true, fill: P.sage },
        { a: 210, len: 22, hgt: 29, droop: false, fill: P.sageD },
      ];
      let out = pot + soil;
      const depth = (l: { a: number }) => Math.cos((l.a * Math.PI) / 180) + Math.sin((l.a * Math.PI) / 180);
      for (const L of [...leaves].sort((A, B) => depth(A) - depth(B))) {
        const a = (L.a * Math.PI) / 180;
        const dx = Math.cos(a), dy = Math.sin(a);
        const px = -dy, py = dx;
        const spine: Array<[number, number, number]> = [];
        for (let i = 0; i <= 6; i++) {
          const t = i / 6;
          const zz = L.droop ? 16 + L.hgt * Math.sin(Math.PI * t) : 16 + L.hgt * Math.sqrt(t);
          spine.push([dx * L.len * t, dy * L.len * t, zz]);
        }
        const poly: Array<[number, number, number]> = [];
        for (let i = 0; i <= 6; i++) {
          const wd = 3.4 * Math.sin(Math.PI * (0.12 + (0.88 * i) / 6));
          poly.push([spine[i][0] + px * wd, spine[i][1] + py * wd, spine[i][2]]);
        }
        for (let i = 6; i >= 0; i--) {
          const wd = 3.4 * Math.sin(Math.PI * (0.12 + (0.88 * i) / 6));
          poly.push([spine[i][0] - px * wd, spine[i][1] - py * wd, spine[i][2]]);
        }
        out += c.quad(L.fill, poly, shade(L.fill, -0.45), 0.6);
      }
      return out + dot(c, 0, 0, 17, 2.4, "#5A6B49");
    },
  },
};

const FALLBACK: Builder = { w: 40, d: 40, h: 30, draw: (c) => lbox(c, -20, 20, -20, 20, 0, 30, P.wood) };
const getBuilder = (id: string): Builder => BUILDERS[id] ?? FALLBACK;

export const getSpec = (id: string) => {
  const b = getBuilder(id);
  return { w: b.w, d: b.d, h: b.h, surface: b.surface ?? null };
};
export const canStack = (id: string) => !!getBuilder(id).stack;

export function footprintOf(id: string, rot: number) {
  const b = getBuilder(id);
  return norm90(rot) % 180 === 0 ? { w: b.w, d: b.d } : { w: b.d, d: b.w };
}

export function footprintCorners(id: string, rot: number): Array<{ dx: number; dy: number }> {
  const { w, d } = footprintOf(id, rot);
  return [
    { dx: -w / 2, dy: -d / 2 }, { dx: w / 2, dy: -d / 2 },
    { dx: w / 2, dy: d / 2 }, { dx: -w / 2, dy: d / 2 },
  ];
}

/** Rest height for an item whose anchor sits over a desk footprint (8 cm grace). */
export function supportZ(productId: string, x: number, y: number, others: PlanItem[]): number {
  if (!canStack(productId)) return 0;
  let best = 0;
  for (const o of others) {
    const b = getBuilder(o.productId);
    if (!b.surface) continue;
    const f = footprintOf(o.productId, o.rotation ?? 0);
    if (x >= o.x - f.w / 2 - 8 && x <= o.x + f.w / 2 + 8 && y >= o.y - f.d / 2 - 8 && y <= o.y + f.d / 2 + 8) {
      best = Math.max(best, b.surface);
    }
  }
  return best;
}

export interface SceneEntry<T extends PlanItem> { item: T; z: number; key: number }

/** Depth-sorted scene: painter's order with on-desk items keyed after their support. */
export function resolveScene<T extends PlanItem>(items: T[]): SceneEntry<T>[] {
  return items
    .map((item, i) => {
      let z = 0;
      let supKey = -Infinity;
      if (canStack(item.productId)) {
        for (const o of items) {
          if (o === item) continue;
          const b = getBuilder(o.productId);
          if (!b.surface) continue;
          const f = footprintOf(o.productId, o.rotation ?? 0);
          const inside =
            item.x >= o.x - f.w / 2 - 8 && item.x <= o.x + f.w / 2 + 8 &&
            item.y >= o.y - f.d / 2 - 8 && item.y <= o.y + f.d / 2 + 8;
          if (inside && b.surface > z) { z = b.surface; supKey = o.x + o.y; }
        }
      }
      const key = Math.max(item.x + item.y + z * 0.4, z > 0 ? supKey + 0.6 : -Infinity) + i * 1e-4;
      return { item, z, key };
    })
    .sort((a, b) => a.key - b.key);
}

// --- Sprites (anchored so the item's floor point sits at a known position) ---

export interface SpriteMeta { width: number; height: number; ax: number; ay: number }

const spriteCache = new Map<string, { svg: string; meta: SpriteMeta }>();

export function spriteFor(id: string, rot = 0): { svg: string; meta: SpriteMeta } {
  const r = norm90(rot);
  const key = `${id}:${r}`;
  let s = spriteCache.get(key);
  if (!s) {
    const b = getBuilder(id);
    const half = (b.w + b.d) / 2;
    const pad = b.pad ?? [8, 10, 8, 8];
    const minX = -half - pad[0];
    const maxX = half + pad[2];
    const maxY = (b.w + b.d) / 4 + pad[3];
    const minY = -((b.w + b.d) / 4) - b.h - pad[1];
    const meta: SpriteMeta = { width: maxX - minX, height: maxY - minY, ax: -minX, ay: -minY };
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${num(meta.width * 2)}" height="${num(meta.height * 2)}" viewBox="0 0 ${num(meta.width)} ${num(meta.height)}">` +
      `<g transform="translate(${num(meta.ax)} ${num(meta.ay)})">${b.draw(ctxFor(r))}</g></svg>`;
    s = { svg, meta };
    spriteCache.set(key, s);
  }
  return s;
}

const uriCache = new Map<string, string>();
export function spriteDataUri(id: string, rot = 0): string {
  const key = `${id}:${norm90(rot)}`;
  let u = uriCache.get(key);
  if (!u) {
    u = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(spriteFor(id, rot).svg)}`;
    uriCache.set(key, u);
  }
  return u;
}
export const artDataUri = (id: string) => spriteDataUri(id, 0);
export const spriteMeta = (id: string, rot = 0) => spriteFor(id, rot).meta;

// --- The room: floor diamond, two back walls, window, door ---

const roomCache = new Map<string, string>();

export function roomInner(grid: boolean): string {
  const key = grid ? "g" : "p";
  let s = roomCache.get(key);
  if (s) return s;

  const L = (a: [number, number, number], b: [number, number, number], stroke: string, sw: number, dash?: string) =>
    `<path d="M ${pt(...a)} L ${pt(...b)}" stroke="${stroke}" stroke-width="${sw}" fill="none"${dash ? ` stroke-dasharray="${dash}"` : ""} stroke-linecap="round"/>`;

  const floor = `<polygon points="${[pt(0, 0), pt(ROOM_W, 0), pt(ROOM_W, ROOM_H), pt(0, ROOM_H)].join(" ")}" fill="#F3EBDA"/>`;

  let gridLines = "";
  if (grid) {
    for (let x = 40; x < ROOM_W; x += 40)
      gridLines += `<line x1="${x}" y1="${x / 2}" x2="${x - ROOM_H}" y2="${x / 2 + ROOM_H / 2}" stroke="#E6DBC4" stroke-width="1"/>`;
    for (let y = 40; y < ROOM_H; y += 40)
      gridLines += `<line x1="${-y}" y1="${y / 2}" x2="${ROOM_W - y}" y2="${(ROOM_W + y) / 2}" stroke="#E6DBC4" stroke-width="1"/>`;
  }

  const light = `<polygon points="${[pt(150, 0), pt(290, 0), pt(322, 118), pt(182, 118)].join(" ")}" fill="#FBF3DC" opacity="0.7"/>`;
  const wallA = `<polygon points="${[pt(0, 0, WALL_H), pt(ROOM_W, 0, WALL_H), pt(ROOM_W, 0, 0), pt(0, 0, 0)].join(" ")}" fill="#FBF6EA"/>`;
  const wallB = `<polygon points="${[pt(0, 0, WALL_H), pt(0, ROOM_H, WALL_H), pt(0, ROOM_H, 0), pt(0, 0, 0)].join(" ")}" fill="#F2EADA"/>`;
  const bbA = `<polygon points="${[pt(0, 2, 8), pt(ROOM_W, 2, 8), pt(ROOM_W, 2, 0), pt(0, 2, 0)].join(" ")}" fill="#E3D8C2"/>`;
  const bbB = `<polygon points="${[pt(2, 0, 8), pt(2, ROOM_H, 8), pt(2, ROOM_H, 0), pt(2, 0, 0)].join(" ")}" fill="#E3D8C2"/>`;

  const win =
    `<polygon points="${[pt(148, 0, 228), pt(292, 0, 228), pt(292, 0, 158), pt(148, 0, 158)].join(" ")}" fill="#E7F0EC"/>` +
    `<polygon points="${[pt(148, 0, 158), pt(292, 0, 158), pt(292, 0, 88), pt(148, 0, 88)].join(" ")}" fill="#D3E2DB"/>` +
    `<polygon points="${[pt(148, 0, 228), pt(292, 0, 228), pt(292, 0, 88), pt(148, 0, 88)].join(" ")}" fill="none" stroke="#3A342C" stroke-width="2.6"/>` +
    L([196, 0, 88], [196, 0, 228], "#3A342C", 1.6) +
    L([243, 0, 88], [243, 0, 228], "#3A342C", 1.6) +
    L([148, 0, 158], [292, 0, 158], "#3A342C", 1.6) +
    `<polygon points="${[pt(144, 0, 86), pt(296, 0, 86), pt(296, 0, 80), pt(144, 0, 80)].join(" ")}" fill="#E8DFC9" stroke="#3A342C" stroke-width="1.2"/>`;

  const hp = project(0, 258, 96);
  const door =
    `<polygon points="${[pt(0, 250, 200), pt(0, 310, 200), pt(0, 310, 0), pt(0, 250, 0)].join(" ")}" fill="#EDE4CF" stroke="#3A342C" stroke-width="2.2"/>` +
    `<polygon points="${[pt(0, 256, 168), pt(0, 304, 168), pt(0, 304, 120), pt(0, 256, 120)].join(" ")}" fill="none" stroke="#C9BA9C" stroke-width="1.4"/>` +
    `<circle cx="${num(hp.x)}" cy="${num(hp.y)}" r="2.6" fill="#3A342C"/>`;

  const swingPts: string[] = [];
  for (let i = 0; i <= 14; i++) {
    const a = (Math.PI / 2) * (i / 14);
    swingPts.push(pt(60 * Math.sin(a), 310 - 60 * Math.cos(a)));
  }
  const swing = `<polyline points="${swingPts.join(" ")}" fill="none" stroke="#B9AF9B" stroke-width="1.4" stroke-dasharray="5 4"/>`;

  const edges =
    L([0, 0, 0], [ROOM_W, 0, 0], "#3A342C", 2) +
    L([0, 0, 0], [0, ROOM_H, 0], "#3A342C", 2) +
    L([ROOM_W, 0, 0], [ROOM_W, ROOM_H, 0], "#3A342C", 3.5) +
    L([ROOM_W, ROOM_H, 0], [0, ROOM_H, 0], "#3A342C", 3.5) +
    L([0, 0, WALL_H], [ROOM_W, 0, WALL_H], "#3A342C", 3) +
    L([0, 0, WALL_H], [0, ROOM_H, WALL_H], "#3A342C", 3) +
    L([0, 0, 0], [0, 0, WALL_H], "#3A342C", 2.6) +
    L([ROOM_W, 0, 0], [ROOM_W, 0, WALL_H], "#3A342C", 2.6) +
    L([0, ROOM_H, 0], [0, ROOM_H, WALL_H], "#3A342C", 2.6);

  s = floor + gridLines + light + wallA + wallB + bbA + bbB + win + door + swing + edges;
  roomCache.set(key, s);
  return s;
}

const roomUriCache = new Map<string, string>();
export function roomDataUri(grid: boolean): string {
  const key = grid ? "g" : "p";
  let u = roomUriCache.get(key);
  if (!u) {
    u = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${SCENE_W * 2}" height="${SCENE_H * 2}" viewBox="0 0 ${SCENE_W} ${SCENE_H}"><g transform="translate(${SCENE_OX} ${SCENE_OY})">${roomInner(grid)}</g></svg>`,
    )}`;
    roomUriCache.set(key, u);
  }
  return u;
}

// --- Full scene renderer (hero, presets, review, confirmation) ---

export interface PlanDim { from: { x: number; y: number }; to: { x: number; y: number }; label: string }

export function planSvg(items: PlanItem[], dim?: PlanDim): string {
  const parts: string[] = [roomInner(true)];
  for (const { item, z } of resolveScene(items)) {
    const f = footprintOf(item.productId, item.rotation ?? 0);
    const p = project(item.x, item.y, z);
    const sh = [
      pt(item.x - f.w / 2 - 2, item.y - f.d / 2 - 2, z),
      pt(item.x + f.w / 2 + 2, item.y - f.d / 2 - 2, z),
      pt(item.x + f.w / 2 + 2, item.y + f.d / 2 + 2, z),
      pt(item.x - f.w / 2 - 2, item.y + f.d / 2 + 2, z),
    ].join(" ");
    parts.push(`<polygon points="${sh}" fill="rgba(58,52,44,0.10)"/>`);
    const { meta } = spriteFor(item.productId, item.rotation ?? 0);
    parts.push(`<image x="${num(p.x - meta.ax)}" y="${num(p.y - meta.ay)}" width="${num(meta.width)}" height="${num(meta.height)}" href="${spriteDataUri(item.productId, item.rotation ?? 0)}"/>`);
  }
  if (dim) {
    const a = project(dim.from.x, dim.from.y);
    const b = project(dim.to.x, dim.to.y);
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const horiz = Math.abs(dim.to.x - dim.from.x) >= Math.abs(dim.to.y - dim.from.y);
    const tick = (w: { x: number; y: number }) => {
      const t1 = horiz ? project(w.x, w.y - 5) : project(w.x - 5, w.y);
      const t2 = horiz ? project(w.x, w.y + 5) : project(w.x + 5, w.y);
      return `<path d="M ${num(t1.x)},${num(t1.y)} L ${num(t2.x)},${num(t2.y)}" stroke="#8B8271" stroke-width="1" fill="none"/>`;
    };
    parts.push(
      `<path d="M ${num(a.x)},${num(a.y)} L ${num(b.x)},${num(b.y)}" stroke="#8B8271" stroke-width="1" fill="none"/>` +
      tick(dim.from) + tick(dim.to) +
      `<text x="${num(mid.x)}" y="${num(mid.y - 6)}" font-family="ui-monospace, 'SF Mono', Menlo, monospace" font-size="10" fill="#8B8271" text-anchor="middle" letter-spacing="0.5">${dim.label}</text>`,
    );
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SCENE_W * 2}" height="${SCENE_H * 2}" viewBox="0 0 ${SCENE_W} ${SCENE_H}">` +
    `<g transform="translate(${SCENE_OX} ${SCENE_OY})">${parts.join("")}</g></svg>`
  );
}

export const planDataUri = (items: PlanItem[], dim?: PlanDim) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(planSvg(items, dim))}`;