"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PRESETS } from "@/data/presets";
import { computeSummary, findDuration } from "@/lib/pricing";
import { useWorkspace } from "@/store/workspace-store";
import { PresetPicker } from "@/components/studio/preset-picker";
import { StudioLayout } from "@/components/studio/studio-layout";
import { RentalReviewModal } from "@/components/studio/rental-review-modal";
import { ConfirmationScreen, type DemoOrder } from "@/components/studio/confirmation-screen";

export default function StudioPage() {
  return (
    <Suspense fallback={null}>
      <Studio />
    </Suspense>
  );
}

function Studio() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const params = useSearchParams();
  const items = useWorkspace((s) => s.items);
  const duration = useWorkspace((s) => s.duration);
  const dirty = useWorkspace((s) => s.dirty);
  const activePresetId = useWorkspace((s) => s.activePresetId);
  const loadPreset = useWorkspace((s) => s.loadPreset);
  const clearWorkspace = useWorkspace((s) => s.clearWorkspace);

  const hasWork = items.length > 0 || activePresetId !== null || dirty;
  const [view, setView] = useState<"picker" | "studio">("picker");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [order, setOrder] = useState<DemoOrder | null>(null);
  const bootstrapped = useRef(false);

  // Restore persisted workspace / honor ?preset= once, after hydration.
  useEffect(() => {
    if (!mounted || bootstrapped.current) return;
    bootstrapped.current = true;
    if (hasWork) setView("studio");
    const presetParam = params.get("preset");
    if (presetParam) {
      const ps = PRESETS.find((p) => p.id === presetParam);
      if (ps) {
        if (items.length === 0 && !dirty) {
          loadPreset(ps.id);
          setView("studio");
          if (ps.items.length) toast.success(`Loaded “${ps.name}”`);
        } else {
          setView("studio");
          toast("Kept your current studio — open Presets to switch.");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-sage" />Warming up the studio…
        </div>
      </div>
    );
  }

  if (order) {
    return (
      <ConfirmationScreen
        order={order}
        onBack={() => setOrder(null)}
        onNewSetup={() => {
          clearWorkspace();
          setOrder(null);
          setView("picker");
        }}
      />
    );
  }

  if (view === "picker") {
    return (
      <PresetPicker
        onSelect={(id) => {
          loadPreset(id);
          setView("studio");
          const ps = PRESETS.find((p) => p.id === id);
          if (ps && ps.items.length) toast.success(`Loaded “${ps.name}”`);
        }}
      />
    );
  }

  return (
    <>
      <StudioLayout onRent={() => setReviewOpen(true)} />
      <RentalReviewModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        onConfirm={(ref) => {
          const s = computeSummary(items, duration);
          setOrder({
            ref,
            total: s.total,
            perWeek: Math.round(s.total / s.weeks),
            durationLabel: findDuration(duration).label,
            itemCount: items.length,
            items: [...items],
          });
          setReviewOpen(false);
        }}
      />
    </>
  );
}