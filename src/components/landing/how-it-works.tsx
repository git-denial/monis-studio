"use client";

import { motion } from "motion/react";
import { LayoutGrid, Move, Truck } from "lucide-react";
import { PRESETS } from "@/data/presets";
import { planDataUri } from "@/lib/art";

const STEPS = [
  { n: "01", icon: LayoutGrid, title: "Pick a starting point", text: "Begin with a curated preset or an empty studio — every piece rents by the week." },
  { n: "02", icon: Move, title: "Arrange it your way", text: "Drag, rotate and layer furniture on a live floor plan. The estimate updates as you build." },
  { n: "03", icon: Truck, title: "We deliver, you work", text: "Gear arrives assembled anywhere on the island. Extend, swap or return anytime." },
];

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
            <img src={uri} alt="Studio floor plan preview" className="w-full rounded-xl" />
            {/* A taste of the configurator: a faux selection with a rotate handle */}
            <div className="pointer-events-none absolute left-[43%] top-[48%] h-[19%] w-[14%] rounded-lg border-2 border-dashed border-sage-deep">
              <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-sage-deep" />
            </div>
            <span className="absolute left-[8%] top-[52%] rounded-full border border-line bg-paper px-2.5 py-1 text-[10px] font-medium shadow-sm">Drag to move</span>
            <span className="absolute right-[10%] top-[28%] rounded-full border border-line bg-paper px-2.5 py-1 text-[10px] font-medium shadow-sm">Rotate</span>
            <span className="absolute bottom-[6%] right-[8%] flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[10px] font-medium text-paper">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" />Estimate updates live
            </span>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            The studio — a drag-and-drop floor plan with a live rental estimate.
          </p>
        </motion.div>
      </div>
    </section>
  );
}