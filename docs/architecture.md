# Architecture

## Overview

The application is a single-page React app that renders procedural botanical growth on an HTML Canvas element. The generative engine lives in `src/lib/` and is orchestrated by the `GenerativeArt` component.

## Component Tree

```
App
├── SVGFilters        -- SVG defs for watercolor + paper-noise filters
├── PaperTexture      -- CSS noise overlay simulating watercolor paper
├── GenerativeArt     -- Canvas rendering, animation loop, scene management
│   └── Brush         -- Canvas 2D context wrapper (stroke, wash, blob)
│   ├── Stem          -- Procedural stem growth with leaves
│   └── Flower        -- Flower types, petal rendering, blooming
└── UILayer           -- Title typography + poem overlay
```

## Generative Engine (`src/lib/`)

### Brush

Wraps `CanvasRenderingContext2D` with organic painting methods:

| Method | Purpose |
|--------|---------|
| `stroke()` | Draws a line with randomized width and HSLA color |
| `wash()` | Fills a circle with translucent color (watercolor bloom) |
| `blob()` | Draws a rotated ellipse with jitter for organic petal shapes |

All methods use `hsla()` with layered transparency to simulate watercolor layering.

### Stem

Each stem is a sequence of segments built in the constructor:

- Segments advance by 5px steps with angular drift toward vertical
- Random leaves spawn along the middle 85% of the stem
- Leaves are 3-lobed blobs with a center vein stroke
- Growth animation increments `currentHeight` each frame

### Flower

Six flower types with distinct petal arrangements:

| Type | Shape | Petal Count | Layering |
|------|-------|-------------|----------|
| 0 | Cup | 12-18 | 3 layers |
| 1 | Cup variant | 3 | 2 layers |
| 2 | Star | 12 | Single layer |
| 3 | Cluster | 40+ | 5 layers |
| 4+ | Fan | 7 | Single layer |

Flowers bloom by scaling petal distance and radius over 60 frames.

## Rendering Pipeline

1. **Paint canvas** (offscreen) — `Brush` draws directly here
2. **Display canvas** (on-screen) — Applies SVG watercolor filter, then `drawImage` from paint canvas
3. **Composite filter** — `url(#watercolor) saturate(0.2) contrast(1.15) brightness(1.05)`

This two-canvas approach preserves the painted content on resize.

## Animation Loop

```
requestAnimationFrame(loop)
  ├── Stem.update()     -- advance growth
  ├── Stem.draw()       -- draw new stem segments + leaves
  ├── Flower.draw()     -- bloom petals + center dots
  ├── renderFrame()     -- composite paint → display canvas
  └── loop or stop      -- continue until all stems + flowers done
```

On completion, `onComplete` callback triggers the poem fade-in.

## Scene Management

- **Resize**: Snapshot paint canvas → resize both canvases → restore snapshot with offset → shift all stem/flower coordinates
- **Responsive**: Stems spawn from bottom-right; count adjusts (15 for <600px, 25 otherwise)
