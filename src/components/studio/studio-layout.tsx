"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useWorkspace } from "@/store/workspace-store";
import { computeSummary } from "@/lib/pricing";
import { formatIDR } from "@/lib/format-currency";
import { ProductLibrary } from "./product-library";
import { WorkspaceSummary } from "./workspace-summary";
import { PresetDialog } from "./preset-dialog";

const WorkspaceCanvas = dynamic(() => import("./workspace-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-cream">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="h-2 w-2 animate-pulse rounded-full bg-sage" />Loading canvas…
      </div>
    </div>
  ),
});

export function StudioLayout({ onRent }: { onRent: () => void }) {
  const items = useWorkspace((s) => s.items);
  const duration = useWorkspace((s) => s.duration);
  const itemCount = items.length;
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const total = useMemo(() => computeSummary(items, duration).total, [items, duration]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight">
            monis<span className="text-terracotta">.</span>rent
          </Link>
          <Badge variant="outline" className="hidden font-medium text-muted-foreground sm:inline-flex">Studio</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground md:inline">Demo · estimates only</span>
          <PresetDialog />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[330px_minmax(0,1fr)_360px]">
        <aside className="hidden min-h-0 border-r border-line lg:block">
          <ProductLibrary />
        </aside>
        <main className="relative min-h-0">
          <WorkspaceCanvas
            onOpenCatalog={() => setCatalogOpen(true)}
            onOpenSummary={() => setSummaryOpen(true)}
          />
        </main>
        <aside className="hidden min-h-0 border-l border-line lg:block">
          <WorkspaceSummary onRent={onRent} />
        </aside>
      </div>

      {/* Mobile action bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-line bg-paper px-3 py-2 lg:hidden">
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setCatalogOpen(true)}>
          <LayoutGrid className="h-4 w-4" />Catalog
        </Button>
        <button type="button" onClick={() => setSummaryOpen(true)} className="flex min-w-0 flex-1 flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {itemCount} {itemCount === 1 ? "piece" : "pieces"} · tap to review
          </span>
          <span className="text-sm font-semibold leading-tight tabular-nums">{formatIDR(total)}</span>
        </button>
        <Button size="sm" className="rounded-full font-display font-semibold" disabled={!itemCount} onClick={onRent}>
          Rent<ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile drawers */}
      <Sheet open={catalogOpen} onOpenChange={setCatalogOpen}>
        <SheetContent side="left" className="w-[88vw] gap-0 p-0 sm:max-w-[360px]">
          <SheetTitle className="sr-only">Product catalog</SheetTitle>
          <ProductLibrary />
        </SheetContent>
      </Sheet>
      <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
        <SheetContent side="right" className="w-[92vw] gap-0 p-0 sm:max-w-[380px]">
          <SheetTitle className="sr-only">Workspace summary</SheetTitle>
          <WorkspaceSummary
            onRent={() => {
              setSummaryOpen(false);
              onRent();
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
