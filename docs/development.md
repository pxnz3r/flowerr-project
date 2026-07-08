# Development

## Prerequisites

- Node.js 22+
- npm

## Setup

```bash
npm install
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot module replacement |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm run deploy` | Build and push to GitHub Pages (manual fallback) |

## Project Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Root component
├── index.css             # Tailwind v4, theme, animations
├── components/           # React UI components
│   ├── GenerativeArt.tsx # Canvas + animation loop
│   ├── SVGFilters.tsx    # Watercolor SVG filters
│   ├── PaperTexture.tsx  # Paper overlay
│   └── UILayer.tsx       # Title + poem
└── lib/                  # Generative engine
    ├── palette.ts        # Colors + types
    ├── brush.ts          # Canvas drawing methods
    ├── stem.ts           # Stem growth
    ├── flower.ts         # Flower shapes
    └── index.ts          # Barrel exports
```

## Code Style

- TypeScript with strict mode
- React 19 functional components with hooks
- Tailwind CSS v4 for styling
- Canvas API for rendering (no external graphics library)
- ESLint flat config with typescript-eslint and react-hooks rules

## Deployment

Automated via GitHub Actions (`.github/workflows/deploy.yml`):

- Trigger: push to `main` or manual workflow dispatch
- Builds with `npm ci && npm run build`
- Uploads `dist/` as Pages artifact
- Deploys via `actions/deploy-pages`

Manual fallback:

```bash
npm run deploy
```
