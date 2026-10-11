"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Group, Image as KonvaImage, Ellipse, Line, Transformer } from "react-konva";
import type Konva from "konva";
import { AnimatePresence, motion } from "motion/react";
import { Armchair, Copy, MousePointerClick, RotateCcw, RotateCw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/data/products";
import { useWorkspace } from "@/store/workspace-store";
import { artDataUri, getArt, roomDataUri, ROOM_H, ROOM_W } from "@/lib/art";
import { findProduct } from "@/lib/pricing";
import { CanvasToolbar } from "./canvas-toolbar";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const round5 = (v: number) => Math.round(v / 5) * 5;

export default function WorkspaceCanvas({
  onOpenCatalog,
  onOpenSummary,
}: {
  onOpenCatalog: () => void;
  onOpenSummary: () => void;
}) {
  const items = useWorkspace((s) => s.items);
  const selectedUid = useWorkspace((s) => s.selectedUid);
  const lastAddedUid = useWorkspace((s) => s.lastAddedUid);
  const select = useWorkspace((s) => s.select);
  const setItemTransform = useWorkspace((s) => s.setItemTransform);
  const removeItem = useWorkspace((s) => s.removeItem);
  const duplicateItem = useWorkspace((s) => s.duplicateItem);

  const [zoom, setZoom] = useState(1);
  const [gridOn, setGridOn] = useState(true);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [roomImgs, setRoomImgs] = useState<Record<string, HTMLImageElement>>({});

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);
  const vGuideRef = useRef<Konva.Line | null>(null);
  const hGuideRef = useRef<Konva.Line | null>(null);
  const prevAdded = useRef<string | null>(null);

  // Responsive stage size — world coordinates (cm) stay stable across viewports.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Preload all artwork as data-URI images (no network, nothing to 404).
  useEffect(() => {
    let alive = true;
    const load = (src: string) =>
      new Promise<HTMLImageElement>((resolve) => {
        const im = new window.Image();
        im.onload = () => resolve(im);
        im.src = src;
      });
    PRODUCTS.forEach((p) => {
      load(artDataUri(p.id)).then((im) => alive && setImages((prev) => ({ ...prev, [p.id]: im })));
    });
    load(roomDataUri(true)).then((im) => alive && setRoomImgs((prev) => ({ ...prev, grid: im })));
    load(roomDataUri(false)).then((im) => alive && setRoomImgs((prev) => ({ ...prev, plain: im })));
    return () => {
      alive = false;
    };
  }, []);

  // Attach the transformer (dashed outline + rotate handle) to the selection.
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selectedUid ? layerRef.current?.findOne(`#${selectedUid}`) : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedUid, items]);

  // Pop-in when a piece is added (ease-out-back), respecting reduced motion.
  useEffect(() => {
    if (!lastAddedUid || lastAddedUid === prevAdded.current) return;
    prevAdded.current = lastAddedUid;
    const node = layerRef.current?.findOne(`#${lastAddedUid}`);
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t0 = performance.now();
    const dur = 420;
    const c1 = 1.70158;
    const c3 = c1 + 1;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
      const s = 0.55 + 0.45 * e;
      node.scaleX(s);
      node.scaleY(s);
      node.getLayer()?.batchDraw();
      if (k < 1) raf = requestAnimationFrame(tick);
      else {
        node.scaleX(1);
        node.scaleY(1);
        node.getLayer()?.batchDraw();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lastAddedUid]);

  // Keyboard: Delete removes the selection, Escape deselects.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedUid) {
        e.preventDefault();
        removeItem(selectedUid);
      }
      if (e.key === "Escape") select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedUid, removeItem, select]);

  const pad = 34;
  const base = size.w && size.h ? Math.min((size.w - pad * 2) / ROOM_W, (size.h - pad * 2) / ROOM_H) : 1;
  const scale = base * zoom;
  const ox = (size.w - ROOM_W * scale) / 2;
  const oy = (size.h - ROOM_H * scale) / 2;

  const selected = items.find((i) => i.uid === selectedUid) ?? null;
  const selectedProduct = selected ? findProduct(selected.productId) : undefined;
  const selectedArt = selected ? getArt(selected.productId) : null;

  // Snap to room-centre guides while dragging; commit (rounded to 5 cm) on release.
  const handleDragMove = (node: Konva.Node) => {
    let x = node.x();
    let y = node.y();
    const nearX = Math.abs(x - ROOM_W / 2) < 7;
    const nearY = Math.abs(y - ROOM_H / 2) < 7;
    if (nearX) x = ROOM_W / 2;
    if (nearY) y = ROOM_H / 2;
    node.x(clamp(x, 16, ROOM_W - 16));
    node.y(clamp(y, 16, ROOM_H - 16));
    vGuideRef.current?.visible(nearX);
    hGuideRef.current?.visible(nearY);
  };

  const commit = (uid: string, node: Konva.Node) => {
    const rot = ((Math.round(node.rotation() / 5) * 5) % 360 + 360) % 360;
    setItemTransform(uid, round5(clamp(node.x(), 16, ROOM_W - 16)), round5(clamp(node.y(), 16, ROOM_H - 16)), rot);
    vGuideRef.current?.visible(false);
    hGuideRef.current?.visible(false);
  };

  const nudge = (deg: number) => {
    if (!selected) return;
    setItemTransform(selected.uid, selected.x, selected.y, (selected.rotation + deg + 360) % 360);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <CanvasToolbar
        zoom={zoom}
        onZoom={setZoom}
        gridOn={gridOn}
        onToggleGrid={() => setGridOn((g) => !g)}
        itemCount={items.length}
        onOpenCatalog={onOpenCatalog}
        onOpenSummary={onOpenSummary}
      />

      <div ref={wrapRef} className="relative min-h-0 flex-1 overflow-hidden bg-cream" style={{ touchAction: "none" }}>
        {size.w > 0 && (
          <Stage
            width={size.w}
            height={size.h}
            scaleX={scale}
            scaleY={scale}
            x={ox}
            y={oy}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) select(null);
            }}
            onTouchStart={(e) => {
              if (e.target === e.target.getStage()) select(null);
            }}
          >
            <Layer listening={false}>
              {(roomImgs.grid || roomImgs.plain) && (
                <KonvaImage
                  image={gridOn ? roomImgs.grid : roomImgs.plain}
                  width={ROOM_W}
                  height={ROOM_H}
                  shadowColor="#3A342C"
                  shadowOpacity={0.22}
                  shadowBlur={26}
                  shadowOffsetY={8}
                />
              )}
            </Layer>

            <Layer ref={layerRef}>
              {items.map((it) => {
                const art = getArt(it.productId);
                return (
                  <Group
                    key={it.uid}
                    id={it.uid}
                    x={it.x}
                    y={it.y}
                    rotation={it.rotation}
                    draggable
                    onMouseEnter={() => {
                      document.body.style.cursor = "move";
                    }}
                    onMouseLeave={() => {
                      document.body.style.cursor = "default";
                    }}
                    onClick={() => select(it.uid)}
                    onTap={() => select(it.uid)}
                    onDragMove={(e) => handleDragMove(e.target)}
                    onDragEnd={(e) => {
                      commit(it.uid, e.target);
                      select(it.uid);
                    }}
                    onTransformEnd={(e) => commit(it.uid, e.target)}
                  >
                    <Ellipse y={2} radiusX={art.w * 0.46} radiusY={art.h * 0.46} fill="rgba(58,52,44,0.12)" />
                    {images[it.productId] && (
                      <KonvaImage
                        image={images[it.productId]}
                        x={-art.w / 2}
                        y={-art.h / 2}
                        width={art.w}
                        height={art.h}
                        perfectDrawEnabled={false}
                      />
                    )}
                  </Group>
                );
              })}

              {/* Alignment guides */}
              <Line ref={vGuideRef} points={[ROOM_W / 2, 0, ROOM_W / 2, ROOM_H]} stroke="#D97E4A" strokeWidth={1.4} dash={[7, 6]} visible={false} listening={false} />
              <Line ref={hGuideRef} points={[0, ROOM_H / 2, ROOM_W, ROOM_H / 2]} stroke="#D97E4A" strokeWidth={1.4} dash={[7, 6]} visible={false} listening={false} />

              <Transformer
                ref={trRef}
                rotateEnabled
                enabledAnchors={[]}
                anchorCornerRadius={99}
                anchorSize={16}
                anchorFill="#5F7350"
                anchorStroke="#F7F2E7"
                anchorStrokeWidth={2}
                rotateAnchorOffset={30}
                borderStroke="#5F7350"
                borderStrokeWidth={1.6}
                borderDash={[6, 5]}
                padding={4}
                keepRatio={false}
              />
            </Layer>
          </Stage>
        )}

        <OnboardingHint />

        {/* Delightful empty state */}
        <AnimatePresence>
          {items.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-paper text-sage-deep shadow-sm">
                <Armchair className="h-7 w-7" />
              </div>
              <p className="font-display text-lg font-semibold">An empty studio, good light</p>
              <p className="max-w-[240px] text-xs leading-relaxed text-muted-foreground">
                Every great setup starts with a desk. Pick your first piece from the catalog.
              </p>
              <Button size="sm" variant="outline" className="pointer-events-auto mt-1 rounded-full lg:hidden" onClick={onOpenCatalog}>
                Browse catalog
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection HUD */}
        <AnimatePresence>
          {selected && selectedArt && (
            <motion.div
              key="hud"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-paper py-1.5 pl-4 pr-1.5 shadow-lg"
            >
              <div className="mr-2 hidden min-w-0 sm:block">
                <p className="truncate text-xs font-semibold leading-none">{selectedProduct?.name}</p>
                <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">
                  {selectedArt.w} × {selectedArt.h} cm
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Rotate −15°" onClick={() => nudge(-15)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Rotate +15°" onClick={() => nudge(15)}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Duplicate" onClick={() => duplicateItem(selected.uid)}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                title="Remove"
                onClick={() => removeItem(selected.uid)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OnboardingHint() {
  const [seen, setSeen] = useState(true);
  useEffect(() => {
    try {
      setSeen(localStorage.getItem("monis-hint-v1") === "1");
    } catch {
      /* storage unavailable — stay hidden */
    }
  }, []);
  if (seen) return null;
  const dismiss = () => {
    setSeen(true);
    try {
      localStorage.setItem("monis-hint-v1", "1");
    } catch {}
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-[11px] font-medium text-paper shadow-lg"
    >
      <MousePointerClick className="h-3.5 w-3.5 text-sage" />
      <span>Drag to move · round handle rotates · Delete removes</span>
      <button onClick={dismiss} aria-label="Dismiss hint" className="ml-1 rounded-full p-0.5 transition-colors hover:bg-paper/20">
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}