"use client";

import { motion } from "motion/react";
import { LayoutGrid, Move, Truck } from "lucide-react";
import { PRESETS } from "@/data/presets";
import { SCENE_H, SCENE_OX, SCENE_OY, SCENE_W, planDataUri, project } from "@/lib/art";

const STEPS = [
  { n: "01", icon: LayoutGrid, title: "Pick a starting point", text: "Begin with a curated preset or an empty studio — every piece rents by the week." },
  { n: "02", icon: Move, title: "Arrange it your way", text: "Drag, turn and layer furniture in a 2.5D studio. The estimate updates as you build." },
  { n: "03", icon: Truck, title: "We deliver, you work", text: "Gear arrives assembled anywhere on the island. Extend, swap or return anytime." },
];

// A faux selection over the creator preset's chair, drawn with the canvas projection.
const CHAIR = { x: 240, y: 202, hw: 29, hd: 29, h: 96 };
const chairBase = [
  project(CHAIR.x - CHAIR.hw, CHAIR.y - CHAIR.hd),
  project(CHAIR.x + CHAIR.hw, CHAIR.y - CHAIR.hd),
  project(CHAIR.x + CHAIR.hw, CHAIR.y + CHAIR.hd),
  project(CHAIR.x - CHAIR.hw, CHAIR.y + CHAIR.hd),
];
const chairTop = chairBase.map((p) => ({ x: p.x, y: p.y - CHAIR.h }));
const toScene = (p: { x: number; y: number }) => `${(p.x + SCENE_OX).toFixed(1)},${(p.y + SCENE_OY).toFixed(1)}`;
const handle = { x: chairTop[0].x + SCENE_OX, y: chairTop[0].y + SCENE_OY };

export function HowItWorks() {
  const creator = PRESETS.find((p) => p.id === "creator")!;
  const uri = planDataUri(creator.items);

  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-20">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-deep">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            From blank floor to deep work, in three steps.
          </h2>
          <div className="mt-8 divide-y divide-line border-t border-line">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-5 py-5">
                <span className="font-display text-xl font-semibold tabular-nums text-wood">{s.n}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <s.icon className="h-4 w-4 text-sage-deep" />
                    <h3 className="text-sm font-semibold">{s.title}</h3>
                  </div>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: 0.1 }}>
          <div className="relative rounded-2xl border border-line bg-paper p-4 shadow-[0_20px_50px_-28px_rgba(58,52,44,0.4)]">
            <div className="relative">
              <img src={uri} alt="Studio floor plan preview" className="block w-full rounded-xl" />
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} aria-hidden>
                <g fill="none" stroke="#5F7350" strokeWidth="2" strokeDasharray="7 6">
                  <polygon points={chairBase.map(toScene).join(" ")} />
                  {chairBase.map((p, i) => (
                    <line
                      key={i}
                      x1={p.x + SCENE_OX}
                      y1={p.y + SCENE_OY}
                      x2={chairTop[i].x + SCENE_OX}
                      y2={chairTop[i].y + SCENE_OY}
                    />
                  ))}
                  <polygon points={chairTop.map(toScene).join(" ")} />
                </g>
                <circle cx={handle.x} cy={handle.y} r="7" fill="#5F7350" stroke="#F7F2E7" strokeWidth="2.5" />
                <path
                  d={`M ${handle.x + 11} ${handle.y} A 11 11 0 0 1 ${handle.x + 7.8} ${handle.y - 7.8}`}
                  fill="none"
                  stroke="#5F7350"
                  strokeWidth="1.8"
                  strokeDasharray="3 3"
                />
              </svg>
              <span className="absolute rounded-full border border-line bg-paper px-2.5 py-1 text-[10px] font-medium shadow-sm" style={{ left: "44%", top: "84%" }}>
                Drag to move
              </span>
              <span className="absolute rounded-full border border-line bg-paper px-2.5 py-1 text-[10px] font-medium shadow-sm" style={{ left: "26%", top: "48%" }}>
                Double-click turns
              </span>
              <span className="absolute right-[6%] top-[5%] flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[10px] font-medium text-paper">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />Estimate updates live
              </span>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            The studio — a 2.5D floor plan you arrange by hand, priced as you build.
          </p>
        </motion.div>
      </div>
    </section>
  );
}