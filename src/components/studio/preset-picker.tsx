"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PresetGrid } from "./preset-grid";

export function PresetPicker({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
        <span className="font-display text-lg font-semibold tracking-tight">
          monis<span className="text-terracotta">.</span>rent
        </span>
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Home
        </Link>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-deep">Before you begin</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">How do you want to start?</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Pick a curated setup and tweak it, or begin with an empty studio. You can switch presets anytime — nothing is final.
        </p>
        <div className="mt-8">
          <PresetGrid onSelect={onSelect} />
        </div>
        <button
          onClick={() => onSelect("scratch")}
          className="mt-6 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Skip — just give me an empty studio
        </button>
      </main>
    </div>
  );
}