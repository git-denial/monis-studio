import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PresetGallery } from "@/components/landing/preset-gallery";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-line/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="font-display text-xl font-semibold tracking-tight">
            monis<span className="text-terracotta">.</span>rent
          </span>
          <nav className="flex items-center gap-3">
            <Link href="#presets" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
              Explore setups
            </Link>
            <Button asChild size="sm" className="rounded-full font-display font-semibold">
              <Link href="/studio">Design my workspace</Link>
            </Button>
          </nav>
        </div>
      </header>

      <Hero />
      <HowItWorks />
      <PresetGallery />

      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            Design your setup.<br />We&apos;ll handle the rest.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-paper/70">
            Rent premium workspace gear in Bali — by the week, the month, or however long the project runs.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-full bg-sage px-8 font-display text-base font-semibold text-ink hover:bg-sage/80"
          >
            <Link href="/studio">
              Design my workspace<ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-5 text-xs text-paper/50">Demo experience · illustrative IDR pricing · no real bookings</p>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground">
          <span>monis.rent — workspace rentals, Bali</span>
          <span>Demo build · all prices are illustrative estimates in IDR</span>
        </div>
      </footer>
    </div>
  );
}