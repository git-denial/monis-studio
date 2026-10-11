"use client";

import { DURATION_OPTIONS } from "@/data/products";
import { findDuration } from "@/lib/pricing";
import type { DurationId } from "@/types/workspace";
import { cn } from "@/lib/utils";

export function DurationSelector({ value, onChange }: { value: DurationId; onChange: (d: DurationId) => void }) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-1 rounded-xl border border-line bg-background p-1">
        {DURATION_OPTIONS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onChange(d.id)}
            className={cn(
              "rounded-lg py-1.5 text-center transition-all duration-150 active:scale-95",
              value === d.id ? "bg-ink text-paper shadow-sm" : "text-muted-foreground hover:bg-cream hover:text-foreground",
            )}
          >
            <span className="block text-xs font-semibold leading-tight">{d.short}</span>
            {d.multiplier < 1 && (
              <span className={cn("block text-[9px] leading-tight", value === d.id ? "text-sage" : "text-sage-deep")}>
                −{Math.round((1 - d.multiplier) * 100)}%
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground">{findDuration(value).note ?? "Standard weekly rate"}</p>
    </div>
  );
}