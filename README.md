# **monis.rent Studio**

An interactive, 2.5D isometric workspace designer and rental estimation tool for remote workers in Bali.

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/turbopack` |
| **Canvas / Rendering** | [Konva](https://konvajs.org/) and [react-konva](https://github.com/konvajs/react-konva) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) with `persist` middleware |
| **Animations** | [Motion](https://motion.dev/) (formerly Framer Motion) |
| **UI Components & Icons** | [Base UI](https://base-ui.com/), [Radix Slot](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |
| **Typography** | `Space Grotesk` and `Inter` via `next/font` |

## Key Concepts & Implementation Details

### 1. Isometric Coordinate Space

**Location:** `src/lib/art.ts`

The configurator uses a shared dimetric projection system to represent a 3D-like workspace on a 2D canvas.

- **World dimensions:** The room floor is modeled as a `480 cm × 340 cm` rectangle, with a wall height of `240 cm`.
- **Dimetric projection:** World coordinates are mapped to canvas coordinates using the following transformation:

  ```ts
  project(x, y, z) => ({
    x: x - y,
    y: (x + y) / 2 - z
  })
  ```

- **Depth sorting:** The canvas dynamically resolves drawing order through `resolveScene`, using item coordinates and height offsets to ensure that objects on desk surfaces, such as monitors and laptops, render above their supporting furniture.
- **Surface elevation tracking:** When an item with `stack: true` is dragged over a surface, its height (`z`) interpolates smoothly toward the surface elevation. For example, a desk may define `surface: 74`.

### 2. Keyboard Shortcuts

The Studio canvas supports the following interactions:

| Shortcut | Action |
|---|---|
| `R` | Rotate the selected item by 90°. |
| `Delete` / `Backspace` | Delete the selected item. |
| `Esc` | Deselect the active item. |
| Double-click / Double-tap | Rotate the item 90° clockwise. |

## Technical Approach

The main architectural decision was to implement the 2.5D projection as a shared system rather than a visual approximation implemented separately across the application.

A single dimetric projection function drives the Konva canvas, catalog thumbnails, and checkout rendering. This keeps the product visually consistent and enables deterministic rotation in 90-degree increments, footprint-based item placement on desks, and reuse of the actual configurator output in the landing-page hero.

For illustrations, the project uses **procedural SVGs instead of static photography**. This removes external image dependencies, maintains a consistent visual style across the product, and ensures illustrations remain sharp at any scale.

## Key Technical Decisions

### State Management

Zustand with persistence provides a flat, serializable state model. This simplifies state management while keeping server-side rendering (SSR) concerns focused on controlling when persisted state is hydrated.

### Centralized Pricing Logic

Pricing is calculated through a single pure function. Rental durations and discounts are represented as data rather than distributed across individual UI components.

### Canvas Rendering

Konva handles canvas rendering, layering, and drag interactions, avoiding the need to build these primitives from scratch.

The canvas is loaded through `next/dynamic` with SSR disabled, keeping browser-dependent rendering outside the server-rendering path.

## Future Improvements

### 1. Support Arbitrary Rotation

The current projection works well for discrete 90-degree rotations, but free-angle rotation would require a more sophisticated rendering approach.

Potential directions include:

- **Per-angle sprite generation:** Extend the existing architecture to support additional rotation angles.
- **React Three Fiber:** Introduce a more complete 3D rendering solution with realistic stacking, shadows, and camera controls.

### 2. Introduce Composition-Aware Interactions

The next step is to make workspace arrangement more intuitive through spatial rules and object relationships.

Potential improvements include:

- Desk-aware snap points.
- Placement constraints, such as requiring monitors to sit on desks.
- Grouped dragging, allowing items on a desk to move with the desk itself.

These changes would shift the configurator from freeform positioning toward a more intuitive, rule-aware system.

### 3. Add Richer Canvas Editing

Additional editing capabilities would make larger workspace configurations easier to manage.

Potential improvements include:

- **Undo / redo:** Track interaction history and allow users to reverse or restore changes.
- **Multi-select:** Select, move, rotate, or delete multiple items together.

The existing flat item model provides a reasonable starting point, although these features would require explicit interaction and history-management logic.
