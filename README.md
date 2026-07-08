# Generative Study: Organic Flow

A web-based generative art installation that procedurally grows stems and flowers in a watercolor painting style. Built with React, TypeScript, and the Canvas API.

[**View Live Demo**](https://pxnz3r.github.io/flowerr-project/)

## Overview

Organic Flow is a generative art piece that simulates botanical growth in real time. Stems emerge from the bottom of the canvas, curve organically, sprout leaves, and bloom into procedurally-generated flowers with varied forms — cup, star, cluster, and fan shapes. SVG turbulence filters give the artwork a soft watercolor-on-paper aesthetic.

## Tech Stack

- **React 19** — Component architecture with hooks
- **TypeScript** — Type safety
- **Vite** — Build tool and dev server
- **Tailwind CSS v4** — Styling
- **Canvas API** — Procedural rendering and animation

## Project Structure

```
src/
├── App.tsx                 # Root component
├── main.tsx                # Entry point
├── index.css               # Global styles and CSS variables
└── components/
    ├── GenerativeArt.tsx   # Canvas rendering, growth logic, animation loop
    ├── SVGFilters.tsx      # Watercolor and paper-noise SVG filter definitions
    ├── PaperTexture.tsx    # Subtle paper texture overlay
    └── UILayer.tsx         # Title typography and poem display
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run deploy` | Build and publish to GitHub Pages |

## How It Works

- **Stem Growth**: Each stem is a series of segments with randomized angular drift, giving a natural curved appearance.
- **Leaves**: Generated along stems at random intervals, drawn as stretched ellipses.
- **Flowers**: Six distinct types with randomized palettes drawn from a muted earth-tone scheme. Each flower has layered petals and a stamen center.
- **Watercolor Effect**: SVG `feTurbulence` + `feDisplacementMap` creates pigment bleeding. CSS `saturate`, `contrast`, and `brightness` filters simulate paper absorption.
- **Animation**: A `requestAnimationFrame` loop drives stem elongation and flower blooming, ending once all elements are fully grown.

## License

MIT
