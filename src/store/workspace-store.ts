import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ROOM_H, ROOM_W } from "@/lib/art";
import { findProduct } from "@/lib/pricing";
import { PRESETS } from "@/data/presets";
import type { DurationId, WorkspaceItem } from "@/types/workspace";

interface WorkspaceState {
  items: WorkspaceItem[];
  duration: DurationId;
  activePresetId: string | null;
  dirty: boolean;
  selectedUid: string | null;
  lastAddedUid: string | null;
  addProduct: (productId: string) => void;
  removeItem: (uid: string) => void;
  removeLastOf: (productId: string) => void;
  removeAllOf: (productId: string) => void;
  duplicateItem: (uid: string) => void;
  setItemTransform: (uid: string, x: number, y: number, rotation: number) => void;
  select: (uid: string | null) => void;
  setDuration: (d: DurationId) => void;
  loadPreset: (presetId: string) => void;
  resetLayout: () => void;
  clearWorkspace: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      items: [],
      duration: "1m",
      activePresetId: null,
      dirty: false,
      selectedUid: null,
      lastAddedUid: null,

      addProduct: (productId) => {
        const p = findProduct(productId);
        if (!p) return;
        const count = get().items.filter((i) => i.productId === productId).length;
        const item: WorkspaceItem = {
          uid: uid(),
          productId,
          x: clamp(p.defaultPos.x + (count % 3) * 30, 30, ROOM_W - 30),
          y: clamp(p.defaultPos.y + Math.floor(count / 3) * 30, 30, ROOM_H - 30),
          rotation: p.defaultPos.rotation,
        };
        set((s) => ({ items: [...s.items, item], selectedUid: item.uid, lastAddedUid: item.uid, dirty: true }));
      },

      removeItem: (u) =>
        set((s) => ({
          items: s.items.filter((i) => i.uid !== u),
          selectedUid: s.selectedUid === u ? null : s.selectedUid,
          dirty: true,
        })),

      removeLastOf: (productId) => {
        const list = get().items;
        const idx = list.map((i) => i.productId).lastIndexOf(productId);
        if (idx < 0) return;
        const removed = list[idx].uid;
        set((s) => ({
          items: list.filter((_, i) => i !== idx),
          dirty: true,
          selectedUid: s.selectedUid === removed ? null : s.selectedUid,
        }));
      },

      removeAllOf: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId), dirty: true })),

      duplicateItem: (u) => {
        const it = get().items.find((i) => i.uid === u);
        if (!it) return;
        const copy: WorkspaceItem = { ...it, uid: uid(), x: clamp(it.x + 28, 20, ROOM_W - 20), y: clamp(it.y + 24, 20, ROOM_H - 20) };
        set((s) => ({ items: [...s.items, copy], selectedUid: copy.uid, lastAddedUid: copy.uid, dirty: true }));
      },

      setItemTransform: (u, x, y, rotation) =>
        set((s) => ({ items: s.items.map((i) => (i.uid === u ? { ...i, x, y, rotation } : i)), dirty: true })),

      select: (u) => set({ selectedUid: u }),
      setDuration: (d) => set({ duration: d, dirty: true }),

      loadPreset: (presetId) => {
        const ps = PRESETS.find((p) => p.id === presetId);
        if (!ps) return;
        set({
          items: ps.items.map((it) => ({ ...it, uid: uid() })),
          duration: ps.duration,
          activePresetId: ps.id,
          dirty: false,
          selectedUid: null,
          lastAddedUid: null,
        });
      },

      resetLayout: () => {
        const groups = new Map<string, number>();
        set((s) => ({
          items: s.items.map((i) => {
            const p = findProduct(i.productId);
            if (!p) return i;
            const k = groups.get(i.productId) ?? 0;
            groups.set(i.productId, k + 1);
            return {
              ...i,
              x: clamp(p.defaultPos.x + (k % 3) * 30, 30, ROOM_W - 30),
              y: clamp(p.defaultPos.y + Math.floor(k / 3) * 30, 30, ROOM_H - 30),
              rotation: p.defaultPos.rotation,
            };
          }),
          dirty: false,
          selectedUid: null,
        }));
      },

      clearWorkspace: () =>
        set({ items: [], activePresetId: null, dirty: false, selectedUid: null, lastAddedUid: null }),
    }),
    {
      name: "monis-workspace-v1",
      partialize: (s) => ({ items: s.items, duration: s.duration, activePresetId: s.activePresetId, dirty: s.dirty }),
    },
  ),
);