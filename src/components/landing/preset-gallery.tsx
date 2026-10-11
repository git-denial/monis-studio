"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Plus } from "lucide-react";
import { PRESETS } from "@/data/presets";
import { planDataUri } from "@/lib/art";
import { weeklyRateFor } from "@/lib/pricing";
import { formatIDR } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

const SPANS = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"];

export function PresetGallery() {
  return (
    <section id="presets" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-deep">Curated setups</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Start from something good.</h2>
          </motion.div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Four starting points tuned for different kinds of work. Load one into the studio and make it yours.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          {PRESETS.map((ps, i) => {
            const isScratch = ps.items.length === 0;
            const uri = planDataUri(ps.items);
            return (
              <motion.div
                key={ps.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={SPANS[i % SPANS.length]}
              >
                <Link
                  href={`/studio?preset=${ps.id}`}
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_44px_-24px_rgba(58,52,44,0.45)]",
                    isScratch ? "border-dashed border-line" : "border-line bg-paper",
                  )}
                >
                  <div className="relative aspect-[480/340] overflow-hidden border-b border-line">
                    <img
                      src={uri}
                      alt={`${ps.name} floor plan`}
                      className={cn("h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]", isScratch && "opacity-40")}
                    />
                    {isScratch && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-line bg-paper shadow-sm">
                          <Plus className="h-5 w-5 text-sage-deep" />
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">An empty studio — your move</span>
                      </div>
                    )}
                    <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-medium text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      Open in studio<ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold tracking-tight">{ps.name}</h3>
                      <span className="text-[11px] text-muted-foreground">{ps.items.length} pieces</span>
                    </div>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{ps.description}</p>
                    <p className="mt-4 text-sm">
                      <span className="font-semibold tabular-nums">
                        {isScratch ? "Build it your way" : `from ${formatIDR(weeklyRateFor(ps.items))} / week`}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{isScratch ? " — add pieces as you go" : " · demo estimate"}</span>
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}