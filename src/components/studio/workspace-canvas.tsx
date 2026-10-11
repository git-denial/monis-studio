"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Group, Image as KonvaImage, Line, Transformer } from "react-konva";
import type Konva from "konva";
import { AnimatePresence, motion } from "motion/react";
import { Armchair, Copy, MousePointerClick, RotateCcw, RotateCw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/data/products";
import { useWorkspace } from "@/store/workspace-store";
import type { WorkspaceItem } from "@/types/workspace";
import {
  ROOM_H, ROOM_W, SCENE_H, SCENE_OX, SCENE_OY, SCENE_W,
  footprintOf, norm90, project, resolveScene, roomDataUri, spriteDataUri, spriteMeta, supportZ,
} from "@/lib/art";
import { findProduct } from "@/lib/pricing";
import { CanvasToolbar } from "./canvas-toolbar";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const round5 = (v: number) => Math.round(v / 5) * 5;
const ROTS = [0, 90, 180, 270];
const SNAP = 8;

// Ease-out-back scale pulse: entrance pop (new items) and turn pulse (rotation).
function animateScale(node: Konva.Node, from: number, dur: number, delay = 0) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const t0 = performance.now() + delay;
  node.scaleX(from);
  node.scaleY(from);
  const tick = (t: number) => {
    if (t < t0) {
      requestAnimationFrame(tick);
      return;
    }
    const k = Math.min(1, (t - t0) / dur);
    const e = 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
    const s = from + (1 - from) * e;
    node.scaleX(s);
    node.scaleY(s);
    node.getLayer()?.batchDraw();
    if (k < 1) requestAnimationFrame(tick);
    else {
      node.scaleX(1);
      node.scaleY(1);
      node.getLayer()?.batchDraw();
    }
  };
  requestAnimationFrame(tick);
}

interface DragState { uid: string; x0: number; y0: number; sx0: number; sy0: number; z0: number }

export default function WorkspaceCanvas({
  onOpenCatalog,
  onOpenSummary,
}: {
  onOpenCatalog: () => void;
  onOpenSummary: () => void;
}) {
  const items = useWorkspace((s) => s.items);
  const selectedUid = useWorkspace((s) => s.selectedUid);
  const select = useWorkspace((s) => s.select);
  const setItemTransform = useWorkspace((s) => s.setItemTransform);
  const removeItem = useWorkspace((s) => s.removeItem);
  const duplicateItem = useWorkspace((s) => s.duplicateItem);

  const [zoom, setZoom] = useState(1);
  const [gridOn, setGridOn] = useState(true);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [sprites, setSprites] = useState<Record<string, HTMLImageElement>>({});
  const [rooms, setRooms] = useState<Record<string, HTMLImageElement>>({});

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);
  const vGuideRef = useRef<Konva.Line | null>(null);
  const hGuideRef = useRef<Konva.Line | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const zLerp = useRef(new Map<string, number>());
  const animRot = useRef(new Map<string, number>());

  // Responsive stage — the projected coordinate system stays stable.
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

  // Preload every sprite orientation plus both room variants (all data URIs).
  useEffect(() => {
    let alive = true;
    const load = (src: string) =>
      new Promise<HTMLImageElement>((resolve) => {
        const im = new window.Image();
        im.onload = () => resolve(im);
        im.src = src;
      });
    for (const p of PRODUCTS) {
      for (const r of ROTS) {
        load(spriteDataUri(p.id, r)).then((im) => {
          if (alive) setSprites((prev) => ({ ...prev, [`${p.id}:${r}`]: im }));
        });
      }
    }
    load(roomDataUri(true)).then((im) => alive && setRooms((p) => ({ ...p, grid: im })));
    load(roomDataUri(false)).then((im) => alive && setRooms((p) => ({ ...p, plain: im })));
    return () => {
      alive = false;
    };
  }, []);

  // Attach the dashed selection outline; keep the transformer above re-sorted items.
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selectedUid ? layerRef.current?.findOne(`#${selectedUid}`) : null;
    tr.nodes(node ? [node] : []);
    tr.moveToTop();
    tr.getLayer()?.batchDraw();
  }, [selectedUid, items]);

  // Entrance pop for new items, pulse when an item turns 90°.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stagger = 0;
    for (const it of items) {
      const prev = animRot.current.get(it.uid);
      const isNew = prev === undefined;
      const turned = prev !== undefined && prev !== it.rotation;
      animRot.current.set(it.uid, it.rotation);
      if (reduced || (!isNew && !turned)) continue;
      const node = layerRef.current?.findOne(`#${it.uid}`);
      if (node) animateScale(node, isNew ? 0.55 : 0.85, isNew ? 420 : 240, isNew ? stagger : 0);
      if (isNew) stagger += 50;
    }
    const uids = new Set(items.map((i) => i.uid));
    for (const k of [...animRot.current.keys()]) if (!uids.has(k)) animRot.current.delete(k);
  }, [items]);

  const selected = items.find((i) => i.uid === selectedUid) ?? null;
  const scene = useMemo(() => resolveScene(items), [items]);
  const selectedEntry = selected ? scene.find((e) => e.item.uid === selected.uid) : undefined;

  const rotateItem = (it: WorkspaceItem, delta = 90) =>
    setItemTransform(it.uid, it.x, it.y, (((it.rotation ?? 0) + delta) % 360 + 360) % 360);

  // Keyboard: Delete removes, R turns, Escape deselects.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedUid) {
        e.preventDefault();
        removeItem(selectedUid);
      }
      if ((e.key === "r" || e.key === "R") && selected) rotateItem(selected);
      if (e.key === "Escape") select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUid, selected, removeItem, select, setItemTransform]);

  // --- Drag: screen deltas invert exactly onto the floor plane (1:1 with cursor) ---
  const beginDrag = (it: WorkspaceItem, z: number) => (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    dragRef.current = { uid: it.uid, x0: it.x, y0: it.y, sx0: node.x(), sy0: node.y(), z0: z };
    zLerp.current.set(it.uid, z);
    select(it.uid);
  };

  const worldFrom = (d: DragState, node: Konva.Node) => {
    // Konva resets the node from the pointer each move, so these deltas stay clean.
    const dsx = node.x() - d.sx0;
    const dsy = node.y() - d.sy0;
    let nx = d.x0 + dsx / 2 + dsy;
    let ny = d.y0 + dsy - dsx / 2;
    const nearX = Math.abs(nx - ROOM_W / 2) < SNAP;
    const nearY = Math.abs(ny - ROOM_H / 2) < SNAP;
    if (nearX) nx = ROOM_W / 2;
    if (nearY) ny = ROOM_H / 2;
    return { nx: clamp(nx, 16, ROOM_W - 16), ny: clamp(ny, 16, ROOM_H - 16), nearX, nearY };
  };

  const onDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const d = dragRef.current;
    if (!d) return;
    const node = e.target;
    const { nx, ny, nearX, nearY } = worldFrom(d, node);
    const item = items.find((i) => i.uid === d.uid);
    // Live elevation: glide up when the anchor crosses onto a desk.
    const target = item ? supportZ(item.productId, nx, ny, items.filter((o) => o.uid !== d.uid)) : 0;
    const cur = zLerp.current.get(d.uid) ?? d.z0;
    const z = cur + (target - cur) * 0.35;
    zLerp.current.set(d.uid, z);
    node.position({ x: nx - ny, y: (nx + ny) / 2 - z });
    vGuideRef.current?.visible(nearX);
    hGuideRef.current?.visible(nearY);
  };

  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    zLerp.current.delete(d.uid);
    vGuideRef.current?.visible(false);
    hGuideRef.current?.visible(false);
    const node = e.target;
    if (Math.abs(node.x() - d.sx0) < 1 && Math.abs(node.y() - d.sy0) < 1) return; // click, not drag
    const { nx, ny } = worldFrom(d, node);
    const item = items.find((i) => i.uid === d.uid);
    if (item) setItemTransform(d.uid, round5(nx), round5(ny), item.rotation);
  };

  // Fit the whole dollhouse (walls included) into the viewport.
  const pad = size.w < 560 ? 12 : 34;
  const base =
    size.w && size.h
      ? Math.max(0.08, Math.min((size.w - pad * 2) / SCENE_W, (size.h - pad * 2) / SCENE_H))
      : 1;
  const scale = base * zoom;
  // Content center in projected units: floor diamond + walls span x [-340,480], y [-240,410].
  const ox = size.w / 2 - 70 * scale;
  const oy = size.h / 2 - 85 * scale;

  const selectedFootprint = selected ? footprintOf(selected.productId, selected.rotation) : null;

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
              {(rooms.grid || rooms.plain) && (
                <KonvaImage
                  image={gridOn ? rooms.grid : rooms.plain}
                  x={-SCENE_OX}
                  y={-SCENE_OY}
                  width={SCENE_W}
                  height={SCENE_H}
                  shadowColor="#3A342C"
                  shadowOpacity={0.16}
                  shadowBlur={30}
                  shadowOffsetY={10}
                />
              )}
            </Layer>

            <Layer ref={layerRef}>
              {scene.map(({ item, z }) => {
                const r = norm90(item.rotation ?? 0);
                const meta = spriteMeta(item.productId, r);
                const img = sprites[`${item.productId}:${r}`];
                const p = project(item.x, item.y, z);
                const f = footprintOf(item.productId, r);
                const hw = f.w / 2 + 2;
                const hd = f.d / 2 + 2;
                // Shadow rides with the anchor, so it lands on whatever surface the item rests on.
                const sh = [
                  [-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd],
                ].flatMap(([dx, dy]) => [dx - dy, (dx + dy) / 2]);
                return (
                  <Group
                    key={item.uid}
                    id={item.uid}
                    x={p.x}
                    y={p.y}
                    draggable
                    onMouseEnter={() => {
                      document.body.style.cursor = "move";
                    }}
                    onMouseLeave={() => {
                      document.body.style.cursor = "default";
                    }}
                    onClick={() => select(item.uid)}
                    onTap={() => select(item.uid)}
                    onDblClick={() => rotateItem(item)}
                    onDblTap={() => rotateItem(item)}
                    onDragStart={beginDrag(item, z)}
                    onDragMove={onDragMove}
                    onDragEnd={onDragEnd}
                  >
                    <Line closed points={sh} fill="rgba(58,52,44,0.12)" listening={false} />
                    {img && (
                      <KonvaImage
                        image={img}
                        x={-meta.ax}
                        y={-meta.ay}
                        width={meta.width}
                        height={meta.height}
                        perfectDrawEnabled={false}
                      />
                    )}
                  </Group>
                );
              })}

              {/* Room-center alignment guides, projected onto the floor */}
              <Line
                ref={vGuideRef}
                points={[ROOM_W / 2, ROOM_W / 4, ROOM_W / 2 - ROOM_H, ROOM_W / 4 + ROOM_H / 2]}
                stroke="#D97E4A"
                strokeWidth={1.4}
                dash={[7, 6]}
                visible={false}
                listening={false}
              />
              <Line
                ref={hGuideRef}
                points={[-ROOM_H / 2, ROOM_H / 4, ROOM_W - ROOM_H / 2, (ROOM_W + ROOM_H) / 2]}
                stroke="#D97E4A"
                strokeWidth={1.4}
                dash={[7, 6]}
                visible={false}
                listening={false}
              />

              <Transformer
                ref={trRef}
                rotateEnabled={false}
                enabledAnchors={[]}
                borderStroke="#5F7350"
                borderStrokeWidth={1.6}
                borderDash={[6, 5]}
                padding={6}
              />
            </Layer>
          </Stage>
        )}

        <OnboardingHint />

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
          {selected && selectedFootprint && (
            <motion.div
              key="hud"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-paper py-1.5 pl-4 pr-1.5 shadow-lg"
            >
              <div className="mr-2 hidden min-w-0 sm:block">
                <p className="truncate text-xs font-semibold leading-none">{findProduct(selected.productId)?.name}</p>
                <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">
                  {selectedFootprint.w} × {selectedFootprint.d} cm
                  {selectedEntry && selectedEntry.z > 0 && <span className="ml-1 text-sage-deep">· on desk</span>}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Turn 90° left" onClick={() => rotateItem(selected, -90)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Turn 90° right" onClick={() => rotateItem(selected, 90)}>
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
      <span>Drag to move · double-click turns · Delete removes</span>
      <button onClick={dismiss} aria-label="Dismiss hint" className="ml-1 rounded-full p-0.5 transition-colors hover:bg-paper/20">
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}