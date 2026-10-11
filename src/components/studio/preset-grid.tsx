"use client";

import { Check, Plus } from "lucide-react";
import { PRESETS } from "@/data/presets";
import { planDataUri } from "@/lib/art";
import { weeklyRateFor } from "@/lib/pricing";
import { formatIDR } from "@/lib/format-currency";
import { useWorkspace } from "@/store/workspace-store";
import { cn } from "@/lib/utils";

export function PresetGrid({ onSelect }: { onSelect: (id: string) => void }) {
  const activePresetId = useWorkspace((s) => s.activePresetId);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PRESETS.map((ps) => {
        const weekly = weeklyRateFor(ps.items);
        const uri = planDataUri(ps.items);
        const isActive = activePresetId === ps.id;
        const isScratch = ps.items.length === 0;
        return (
          <button
            key={ps.id}
            type="button"
            onClick={() => onSelect(ps.id)}
            className={cn(
              "group overflow-hidden rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-20px_rgba(58,52,44,0.45)]",
              isScratch ? "border-dashed border-line bg-transparent hover:border-sage" : "border-line bg-paper",
              isActive && "border-sage ring-2 ring-sage/30",
            )}
          >
            <div className={cn("relative aspect-[480/340] overflow-hidden border-b", isScratch ? "border-dashed border-line" : "border-line")}>
              <img src={uri} alt={`${ps.name} floor plan`} className={cn("h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]", isScratch && "opacity-40")} />
              {isScratch && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-line bg-paper">
                    <Plus className="h-5 w-5 text-sage-deep" />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">An empty studio — your move</span>
                </div>
              )}
              {isActive && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11px] font-medium text-paper">
                  <Check className="h-3 w-3" />Loaded
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-base font-semibold tracking-tight">{ps.name}</h3>
                <span className="shrink-0 text-[11px] text-muted-foreground">{ps.items.length} pieces</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{ps.description}</p>
              <p className="mt-3 text-sm">
                <span className="font-semibold tabular-nums">{isScratch ? "Free to build" : `${formatIDR(weekly)} / week`}</span>
                <span className="text-[11px] text-muted-foreground">{isScratch ? " — add pieces as you go" : " · estimate"}</span>
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}