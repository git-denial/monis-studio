"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { planDataUri } from "@/lib/art";
import { formatIDR } from "@/lib/format-currency";
import type { WorkspaceItem } from "@/types/workspace";

export interface DemoOrder {
  ref: string;
  total: number;
  perWeek: number;
  durationLabel: string;
  itemCount: number;
  items: WorkspaceItem[];
}

export function ConfirmationScreen({
  order,
  onBack,
  onNewSetup,
}: {
  order: DemoOrder;
  onBack: () => void;
  onNewSetup: () => void;
}) {
  const reduced = useReducedMotion();
  const planUri = useMemo(() => planDataUri(order.items), [order]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-xl text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={reduced ? { duration: 0.01 } : { type: "spring", stiffness: 280, damping: 16 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-deep text-paper shadow-lg"
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
            <motion.path
              d="M4.5 12.5 L9.5 17.5 L19.5 6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduced ? 0.01 : 0.45, delay: 0.15, ease: "easeOut" }}
            />
          </svg>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Your workspace is booked<span className="text-terracotta">.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Well — demo-booked. Nothing was charged.
          </p>
          <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-paper px-4 py-2 text-sm shadow-sm">
            <span className="text-xs text-muted-foreground">Booking ref</span>
            <span className="font-mono font-semibold tracking-[0.12em]">{order.ref}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <img src={planUri} alt="Your workspace plan" className="mx-auto mt-8 w-full rounded-2xl border border-line bg-paper p-2 shadow-sm" />
          <div className="mt-5 flex items-center justify-center gap-6 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Pieces</p>
              <p className="font-display text-lg font-semibold tabular-nums">{order.itemCount}</p>
            </div>
            <span className="h-8 w-px bg-line" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Duration</p>
              <p className="font-display text-lg font-semibold">{order.durationLabel}</p>
            </div>
            <span className="h-8 w-px bg-line" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Estimated total</p>
              <p className="font-display text-lg font-semibold tabular-nums">{formatIDR(order.total)}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="outline" size="lg" className="rounded-full" onClick={onNewSetup}>
              Start a new setup
            </Button>
            <Button size="lg" className="rounded-full font-display font-semibold" onClick={onBack}>
              Back to my studio
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            In the real service our Bali team would call to confirm delivery — this demo made none of that happen.
          </p>
        </motion.div>
      </div>
    </div>
  );
}