"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useWorkspace } from "@/store/workspace-store";
import { computeSummary, findDuration } from "@/lib/pricing";
import { planDataUri } from "@/lib/art";
import { formatIDR } from "@/lib/format-currency";

const makeRef = () =>
  "MN-" +
  Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32))).join("");

export function RentalReviewModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (ref: string) => void;
}) {
  const items = useWorkspace((s) => s.items);
  const duration = useWorkspace((s) => s.duration);
  const summary = useMemo(() => computeSummary(items, duration), [items, duration]);
  const dur = findDuration(duration);
  const planUri = useMemo(() => (items.length ? planDataUri(items) : ""), [items]);
  const perWeek = Math.round(summary.total / dur.weeks);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-2xl border-line bg-popover p-0 sm:max-w-3xl">
        <DialogHeader className="space-y-1 border-b border-line px-6 py-4">
          <DialogTitle className="font-display text-lg tracking-tight">Review your rental</DialogTitle>
          <DialogDescription>A quick look before the demo confirmation.</DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[65vh] overflow-y-auto md:grid-cols-2">
          <div className="border-b border-line bg-paper p-5 md:border-b-0 md:border-r">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Your studio plan</p>
            {planUri && <img src={planUri} alt="Workspace floor plan" className="w-full rounded-xl border border-line shadow-sm" />}
            <p className="mt-3 text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "piece" : "pieces"} · arranged by you
            </p>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rental duration</span>
              <span className="font-medium">
                {dur.label}
                {dur.note && <span className="ml-1.5 text-xs text-sage-deep">{dur.note}</span>}
              </span>
            </div>
            <Separator className="my-4 bg-line" />

            <div className="space-y-2.5">
              {summary.lines.map((l) => (
                <div key={l.product.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {l.product.name} <span className="whitespace-nowrap">× {l.qty}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">{formatIDR(l.total)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-4 bg-line" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Weekly subtotal</span>
                <span className="tabular-nums">{formatIDR(summary.weeklySubtotal)}</span>
              </div>
              {summary.discount > 0 && (
                <div className="flex justify-between text-sage-deep">
                  <span>Duration saving</span>
                  <span className="tabular-nums">−{formatIDR(summary.discount)}</span>
                </div>
              )}
              <div className="flex items-end justify-between pt-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Estimated total</p>
                  <p className="text-[11px] text-muted-foreground">≈ {formatIDR(perWeek)} / week</p>
                </div>
                <p className="font-display text-3xl font-semibold tracking-tight tabular-nums">{formatIDR(summary.total)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-cream p-3 text-[11px] leading-relaxed text-muted-foreground">
              Demo experience for Monis.rent. No real booking or payment involved.
            </div>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => onOpenChange(false)}>
                Keep editing
              </Button>
              <Button className="flex-1 rounded-full font-display font-semibold" onClick={() => onConfirm(makeRef())}>
                Confirm demo rental
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}