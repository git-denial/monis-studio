"use client";

import { toast } from "sonner";
import { ClipboardList, Grid3x3, LayoutGrid, RotateCcw, Scan, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { PRESETS } from "@/data/presets";
import { useWorkspace } from "@/store/workspace-store";
import { cn } from "@/lib/utils";

interface Props {
  zoom: number;
  onZoom: (z: number) => void;
  gridOn: boolean;
  onToggleGrid: () => void;
  itemCount: number;
  onOpenCatalog: () => void;
  onOpenSummary: () => void;
}

export function CanvasToolbar({ zoom, onZoom, gridOn, onToggleGrid, itemCount, onOpenCatalog, onOpenSummary }: Props) {
  const activePresetId = useWorkspace((s) => s.activePresetId);
  const dirty = useWorkspace((s) => s.dirty);
  const resetLayout = useWorkspace((s) => s.resetLayout);
  const clearWorkspace = useWorkspace((s) => s.clearWorkspace);

  const presetLabel = activePresetId
    ? PRESETS.find((p) => p.id === activePresetId)?.name ?? "Custom setup"
    : itemCount
      ? "Custom setup"
      : "Empty studio";

  const zoomBy = (f: number) => onZoom(Math.min(2.2, Math.max(0.5, Math.round(zoom * f * 20) / 20)));
  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-cream hover:text-foreground disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-line bg-paper px-2.5 sm:px-3">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={onOpenCatalog}
          className="flex h-8 items-center gap-1.5 rounded-full border border-line bg-background px-3 text-xs font-medium transition-colors hover:border-ink/40 lg:hidden"
        >
          <LayoutGrid className="h-3.5 w-3.5" />Catalog
        </button>
        <button
          onClick={onOpenSummary}
          className="flex h-8 items-center gap-1.5 rounded-full border border-line bg-background px-3 text-xs font-medium transition-colors hover:border-ink/40 lg:hidden"
        >
          <ClipboardList className="h-3.5 w-3.5" />Summary{itemCount ? ` · ${itemCount}` : ""}
        </button>
        <div className="hidden min-w-0 items-center gap-2 lg:flex">
          <span className="truncate text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{presetLabel}</span>
          {dirty && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" title="Customized" />}
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          title="Toggle grid (40 cm)"
          aria-label="Toggle grid"
          onClick={onToggleGrid}
          className={cn(iconBtn, gridOn && "bg-sage/15 text-sage-deep hover:bg-sage/25 hover:text-sage-deep")}
        >
          <Grid3x3 className="h-4 w-4" />
        </button>
        <button
          title="Reset layout"
          aria-label="Reset layout"
          disabled={!itemCount}
          onClick={() => {
            resetLayout();
            toast("Layout reset to the default arrangement");
          }}
          className={iconBtn}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          title="Clear workspace"
          aria-label="Clear workspace"
          disabled={!itemCount}
          onClick={() => {
            clearWorkspace();
            toast("Workspace cleared — blank studio");
          }}
          className={cn(iconBtn, "hover:text-destructive")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-line" />
        <button title="Zoom out" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.2)} className={iconBtn}>
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-11 text-center text-xs font-medium tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
        <button title="Zoom in" aria-label="Zoom in" onClick={() => zoomBy(1.2)} className={iconBtn}>
          <ZoomIn className="h-4 w-4" />
        </button>
        <button title="Fit to view" aria-label="Fit to view" onClick={() => onZoom(1)} className={iconBtn}>
          <Scan className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}