"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_PLAN } from "@/data/presets";
import { findProduct, weeklyRateFor } from "@/lib/pricing";
import { planDataUri } from "@/lib/art";
import { formatIDR } from "@/lib/format-currency";

const price = (id: string) => `${formatIDR(findProduct(id)?.weeklyRate ?? 0)}/wk`;

function FloatLabel({ name, price: p, className, delay = 0 }: { name: string; price: string; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + delay, duration: 0.5 }} className={`absolute ${className ?? ""}`}>
      <motion.div
        animate={reduced ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
        className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-paper px-3 py-1.5 text-[11px] font-medium shadow-[0_8px_20px_-10px_rgba(58,52,44,0.4)]"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-sage" />
        {name}
        <span className="text-muted-foreground">{p}</span>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const reduced = useReducedMotion();
  const planUri = planDataUri(HERO_PLAN, { from: { x: 160, y: 158 }, to: { x: 320, y: 158 }, label: "160 cm" });
  const weekly = weeklyRateFor(HERO_PLAN);

  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
        <motion.div initial={reduced ? undefined : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-deep">
            <span className="h-2 w-2 rounded-[3px] bg-sage" />
            Monis.rent · workspace rentals in Bali
          </div>
          <h1 className="mt-5 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl">
            Your dream workspace.<br />
            <span className="relative inline-block pb-2">
              Delivered in Bali.
              <svg className="absolute bottom-0 left-0 h-[10px] w-full" viewBox="0 0 220 12" preserveAspectRatio="none" aria-hidden>
                <path d="M3 9 C 60 2, 150 2, 217 8" stroke="#D97E4A" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Build your perfect setup piece by piece, rent it by the week or month, and get straight to work. Delivered and assembled anywhere on the island.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-7 font-display text-base font-semibold tracking-tight transition-transform active:scale-[0.97]"
            >
              <Link href="/studio">
                Design my workspace<ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-12 rounded-full px-5 text-base text-muted-foreground hover:text-foreground">
              <Link href="#presets">
                Explore setups<ArrowDown className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Weekly terms · swap gear anytime · desks from {formatIDR(95000)}/wk
          </p>
        </motion.div>

        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[560px]"
        >
          <div className="rounded-2xl border border-line bg-paper p-3 shadow-[0_28px_60px_-30px_rgba(58,52,44,0.45)] transition-transform duration-500 hover:-rotate-[0.6deg]">
            <img src={planUri} alt="Isometric floor plan of a rented workspace" className="w-full rounded-xl" />
          </div>
          <FloatLabel name="Panorama Ultrawide" price={price("monitor-ultra")} className="right-[2%] top-[7%]" delay={0.1} />
          <FloatLabel name="Citra Mesh Chair" price={price("chair-mesh")} className="left-[0%] top-[68%]" delay={0.6} />
          <FloatLabel name="Monsoon Desk Plant" price={price("plant-monsoon")} className="right-[-1%] top-[52%]" delay={1.1} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper shadow-lg"
          >
            This whole setup · <span className="font-semibold tabular-nums">{formatIDR(weekly)}</span> / week · demo est.
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}