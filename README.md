# Generative Study: Organic Flow

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com/)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222?logo=github&logoColor=fff)](https://pages.github.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A web-based generative art installation that procedurally grows stems and flowers in a watercolor painting style. Each visit creates a unique botanical composition.

[**View Live Demo**](https://pxnz3r.github.io/flowerr-project/)

## Features

- **Procedural Growth** — Stems emerge from the bottom, curve organically, and bloom in real-time
- **Six Flower Types** — Cup, star, cluster, fan, and layered variants with randomized palettes
- **Watercolor Aesthetic** — SVG `feTurbulence` + `feDisplacementMap` creates pigment-bleeding effects
- **Paper Texture** — Subtle noise overlay simulates watercolor paper
- **Unique Every Time** — Randomized stem paths, leaf placement, flower types, and color selection
- **Responsive** — Adapts to any screen size; artwork re-centers on resize

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | [TypeScript](https://www.typescriptlang.org/) |
| UI Framework | [React 19](https://react.dev/) |
| Build Tool | [Vite 7](https://vite.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Rendering | [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) |
| SVG Filters | feTurbulence, feDisplacementMap |
| Deployment | [GitHub Pages](https://pages.github.com/) |

## Project Structure

```
src/
├── main.tsx                   # Entry point
├── App.tsx                    # Root component
├── index.css                  # Global styles, theme, animations
├── components/                # React UI components
│   ├── GenerativeArt.tsx      # Canvas component, animation loop, scene management
│   ├── SVGFilters.tsx         # Watercolor & paper-noise SVG filter definitions
│   ├── PaperTexture.tsx       # Paper texture overlay
│   └── UILayer.tsx            # Title typography & poem display
└── lib/                       # Core generative engine
    ├── palette.ts             # Color palettes & flower type selection
    ├── brush.ts               # Canvas brush abstraction (stroke, wash, blob)
    ├── stem.ts                # Stem growth logic & leaf generation
    ├── flower.ts              # Flower types, petal rendering & blooming
    └── index.ts               # Barrel exports
docs/
├── architecture.md            # Generative engine architecture
└── development.md             # Setup, commands, code style, deployment
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

## Architecture

### How It Works

1. **Stem Growth** — Each stem is a series of segments with randomized angular drift, producing natural curves. Stems grow incrementally via `requestAnimationFrame`.
2. **Leaves** — Generated along stems at random intervals, drawn as stretched ellipses with three-lobed blobs.
3. **Flowers** — Six distinct types (cup, cup-variant, star, cluster, fan, default) with muted earth-tone palettes. Petals are rendered as layered ellipses with color variation.
4. **Watercolor Effect** — SVG `feTurbulence` + `feDisplacementMap` creates pigment bleeding. CSS `saturate`, `contrast`, and `brightness` filters simulate paper absorption.
5. **Completion** — When all stems and flowers are fully grown, a poem fades in over the artwork.

### Key Modules

| Module | Responsibility |
|--------|---------------|
| `Brush` | Wraps Canvas 2D context with organic stroke, wash, and blob methods |
| `Stem` | Manages segment-based growth, angular drift, leaf spawning |
| `Flower` | Handles 6 flower types, petal shapes, blooming animation |
| `PALETTE` | Muted earth-tone color scheme (browns, creams, soft blues) |

## Documentation

- [Architecture](docs/architecture.md) — How the generative engine works
- [Development](docs/development.md) — Setup, commands, code style, deployment

## Deployment

The site is deployed to GitHub Pages at `https://pxnz3r.github.io/flowerr-project/`.

Deployment is automated via GitHub Actions — every push to `main` triggers a build and deploy. Manual deployment is also available:

```bash
npm run deploy
```

## Contributing

Contributions are welcome! Please open an issue or pull request.

## License

[MIT](LICENSE)
