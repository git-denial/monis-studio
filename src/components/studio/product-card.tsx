"use client";

import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { artDataUri } from "@/lib/art";
import { formatIDR } from "@/lib/format-currency";
import { useWorkspace } from "@/store/workspace-store";
import type { Product } from "@/types/workspace";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const qty = useWorkspace((s) => s.items.filter((i) => i.productId === product.id).length);
  const addProduct = useWorkspace((s) => s.addProduct);
  const removeLastOf = useWorkspace((s) => s.removeLastOf);

  const add = () => {
    addProduct(product.id);
    toast.success(`Added ${product.name}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex flex-col rounded-xl border p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(58,52,44,0.4)]",
        qty > 0 ? "border-sage bg-sage/[0.08]" : "border-line bg-paper hover:border-sage/60",
      )}
    >
      <button
        type="button"
        onClick={add}
        title={product.description}
        className="relative mb-2.5 flex aspect-square items-center justify-center rounded-lg bg-[#FDFAF2]"
      >
        <img
          src={artDataUri(product.id)}
          alt={product.name}
          draggable={false}
          className="max-h-[82%] max-w-[82%] object-contain drop-shadow-[0_6px_10px_rgba(58,52,44,0.18)] transition-transform duration-300 group-hover:scale-[1.06]"
        />
        <AnimatePresence>
          {qty > 0 && (
            <motion.span
              key={qty}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sage-deep px-1 text-[11px] font-bold text-paper"
            >
              {qty}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <div>
        <p className="text-[13px] font-semibold leading-snug">{product.name}</p>
        <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-muted-foreground">{product.descriptor}</p>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-1">
        <p className="text-[13px] font-semibold tabular-nums leading-none">
          {formatIDR(product.weeklyRate)}
          <span className="text-[10px] font-normal text-muted-foreground"> /wk</span>
        </p>
        {qty === 0 ? (
          <button
            type="button"
            onClick={add}
            aria-label={`Add ${product.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-paper transition-all duration-150 hover:bg-sage-deep active:scale-90"
          >
            <Plus className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-0.5 rounded-full border border-sage/50 bg-paper p-0.5">
            <button
              type="button"
              onClick={() => removeLastOf(product.id)}
              aria-label={`Remove one ${product.name}`}
              className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-sage/20 active:scale-90"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-4 text-center text-xs font-semibold tabular-nums">{qty}</span>
            <button
              type="button"
              onClick={add}
              aria-label={`Add another ${product.name}`}
              className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-sage/20 active:scale-90"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}