"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LayoutGrid, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PRESETS } from "@/data/presets";
import { useWorkspace } from "@/store/workspace-store";
import { PresetGrid } from "./preset-grid";

export function PresetDialog() {
  const [open, setOpen] = useState(false);
  const [ack, setAck] = useState(false);
  const dirty = useWorkspace((s) => s.dirty);
  const itemCount = useWorkspace((s) => s.items.length);
  const loadPreset = useWorkspace((s) => s.loadPreset);

  const needsAck = dirty && itemCount > 0 && !ack;

  const handleSelect = (id: string) => {
    loadPreset(id);
    const ps = PRESETS.find((p) => p.id === id);
    toast.success(ps && ps.items.length ? `Loaded “${ps.name}”` : "Started from scratch");
    setOpen(false);
    setAck(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setAck(false);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />Presets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-2xl border-line bg-popover p-0 sm:max-w-3xl">
        <DialogHeader className="space-y-1 border-b border-line px-6 py-4">
          <DialogTitle className="font-display text-lg tracking-tight">Workspace presets</DialogTitle>
          <DialogDescription>
            {needsAck ? "Replacing your studio — read this first." : "Load a curated starting point. You can keep customizing afterwards."}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[65vh] overflow-y-auto p-4 scrollbar-slim">
          {needsAck ? (
            <div className="mx-auto max-w-md py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                <TriangleAlert className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">Discard your current setup?</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                You&apos;ve customized this workspace — {itemCount} hand-placed {itemCount === 1 ? "piece" : "pieces"}. Loading a preset replaces the whole arrangement.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
                  Keep mine
                </Button>
                <Button className="rounded-full" onClick={() => setAck(true)}>
                  Replace workspace
                </Button>
              </div>
            </div>
          ) : (
            <PresetGrid onSelect={handleSelect} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}