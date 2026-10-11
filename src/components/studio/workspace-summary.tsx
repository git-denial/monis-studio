"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Minus, PackageOpen, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useWorkspace } from "@/store/workspace-store";
import { computeSummary, findDuration } from "@/lib/pricing";
import { artDataUri } from "@/lib/art";
import { formatIDR } from "@/lib/format-currency";
import { DurationSelector } from "./duration-selector";

export function WorkspaceSummary({ onRent }: { onRent: () => void }) {
  const items = useWorkspace((s) => s.items);
  const duration = useWorkspace((s) => s.duration);
  const setDuration = useWorkspace((s) => s.setDuration);
  const addProduct = useWorkspace((s) => s.addProduct);
  const removeLastOf = useWorkspace((s) => s.removeLastOf);
  const removeAllOf = useWorkspace((s) => s.removeAllOf);

  const summary = useMemo(() => computeSummary(items, duration), [items, duration]);
  const dur = findDuration(duration);
  const perWeek = Math.round(summary.total / dur.weeks);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="shrink-0 border-b border-line p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-base font-semibold tracking-tight">Your setup</h2>
          <span className="text-[11px] text-muted-foreground">
            {items.length} {items.length === 1 ? "piece" : "pieces"} on the floor
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-slim">
        {summary.lines.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-line text-muted-foreground">
              <PackageOpen className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">Nothing here yet</p>
            <p className="max-w-[200px] text-xs leading-relaxed text-muted-foreground">
              Pieces you add from the catalog pile up here with a live rental estimate.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {summary.lines.map((l) => (
              <motion.div
                key={l.product.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.18 }}
                className="mb-1 flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-paper"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-line bg-[#FDFAF2]">
                  <img src={artDataUri(l.product.id)} alt="" className="max-h-[80%] max-w-[80%] object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight">{l.product.name}</p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                    {formatIDR(l.product.weeklyRate)}/wk × {l.qty}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 rounded-full border border-line bg-paper p-0.5">
                  <button
                    onClick={() => removeLastOf(l.product.id)}
                    aria-label={`Remove one ${l.product.name}`}
                    className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-cream active:scale-90"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-xs font-semibold tabular-nums">{l.qty}</span>
                  <button
                    onClick={() => addProduct(l.product.id)}
                    aria-label={`Add another ${l.product.name}`}
                    className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-cream active:scale-90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => removeAllOf(l.product.id)}
                  aria-label={`Remove all ${l.product.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="shrink-0 space-y-4 border-t border-line bg-paper p-4">
        <DurationSelector value={duration} onChange={setDuration} />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Weekly subtotal</span>
            <span className="tabular-nums">{formatIDR(summary.weeklySubtotal)}</span>
          </div>
          {summary.discount > 0 && (
            <div className="flex justify-between text-sage-deep">
              <span>Duration saving · {dur.short}</span>
              <span className="tabular-nums">−{formatIDR(summary.discount)}</span>
            </div>
          )}
          <Separator className="my-2 bg-line" />
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Estimated total</p>
              <p className="text-[11px] text-muted-foreground">≈ {formatIDR(perWeek)} / week</p>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={summary.total}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="font-display text-2xl font-semibold tracking-tight tabular-nums"
              >
                {formatIDR(summary.total)}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Duration: {dur.label} ({dur.weeks} {dur.weeks === 1 ? "week" : "weeks"}).
          </p>
        </div>

        <Button
          onClick={onRent}
          disabled={!summary.lines.length}
          className="h-11 w-full rounded-full font-display text-base font-semibold tracking-tight transition-transform active:scale-[0.97]"
        >
          Rent my workspace<ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}