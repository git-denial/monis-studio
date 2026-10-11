"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CATEGORIES, PRODUCTS } from "@/data/products";
import type { CategoryId } from "@/types/workspace";
import { useWorkspace } from "@/store/workspace-store";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";

export function ProductLibrary() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | CategoryId>("all");
  const items = useWorkspace((s) => s.items);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter(
      (p) => (cat === "all" || p.category === cat) && `${p.name} ${p.descriptor}`.toLowerCase().includes(q),
    );
  }, [cat, query]);

  return (
    <div className="flex h-full w-full min-h-0 flex-col bg-background">
      <div className="shrink-0 space-y-3 border-b border-line p-3.5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-base font-semibold tracking-tight">Catalog</h2>
          <span className="text-[11px] text-muted-foreground">{PRODUCTS.length} pieces · weekly rates</span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search desks, lamps, plants…"
            className="h-9 rounded-full border-line bg-paper pl-9 text-sm"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[{ id: "all" as const, label: "All" }, ...CATEGORIES].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                cat === c.id
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-muted-foreground hover:border-ink/40 hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2.5 scrollbar-slim">
        <div className="grid grid-cols-[repeat(2,minmax(170px,1fr))] gap-3 overflow-x-auto min-w-0">
          <AnimatePresence>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </AnimatePresence>
        </div>
        {filtered.length === 0 && (
          <div className="col-span-2 py-10 text-center">
            <p className="text-sm font-medium">Nothing matches “{query}”</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a different search or category.</p>
          </div>
        )}
        {items.length === 0 && filtered.length > 0 && (
          <p className="mt-3 px-1 text-center text-[11px] leading-relaxed text-muted-foreground">
            Tip: click a piece to drop it onto the floor plan.
          </p>
        )}
      </div>
    </div>
  );
}