# Hard Stuff — Demo

A small portfolio-style site for a hardware R&D shop, built for the Hard Stuff
software dev technical challenge. Home page shows a grid of project cards
behind a 3D hero; each project page has an interactive 3D viewer — either an
STL (mechanical model) or a PCB stack built from real Gerber files.

## Run it

```bash
npm install
npm run dev
npm install -D gerber-to-svg @resvg/resvg-js
```

Vite prints a URL, usually `http://localhost:5173`.

## What's in here

```
src/
├── main.jsx                 React root, wraps App in BrowserRouter
├── App.jsx                  Route definitions
├── index.css                Tailwind entry + font setup
├── data/
│   └── projects.js          Hardcoded project data (stand-in for a CMS)
├── components/
│   ├── Layout.jsx           Header + <Outlet /> + footer
│   ├── ProjectCard.jsx      Tile on the home grid
│   ├── HeroPCB.jsx          The big animated PCB on the home page
│   ├── PCBViewer.jsx        PCB viewer on the detail page
│   └── STLViewer.jsx        STL / procedural mesh viewer on the detail page
└── pages/
    ├── Home.jsx             Hero + project grid
    └── Project.jsx          Detail page with embedded viewer

public/
├── gerbers/                 Raw Gerber files (PCB source of truth)
├── layers/                  PNGs generated from the gerbers (build output)
├── models/                  STL files
└── covers/                  Project card cover images

scripts/
└── gerbers-to-layers.mjs    One-shot converter: gerbers → aligned PNGs
```

## The Gerber pipeline

The Sensor Board v22 project renders from the actual production Gerber files
(in `public/gerbers/`). The pipeline:

1. Run `npm run gerbers`.
2. The script reads the board outline first to get a canonical viewBox, then
   converts every other layer to an SVG on that same viewBox so they all line
   up. Each SVG is rasterised to a white-on-transparent PNG silhouette.
3. The output is a set of PNGs in `public/layers/` plus a `manifest.json`.
4. At runtime, each PNG is used as the alpha map of a flat plane in three.js.
   The planes stack on the z-axis; hovering spreads them apart.

The trick worth knowing: colour lives on the material, not the PNG. The PNGs
are neutral silhouettes, so re-theming the board doesn't need a re-run, and
the same pipeline handles any board you throw at it.

To regenerate: drop new gerbers into `public/gerbers/`, run `npm run gerbers`,
restart the dev server.

## Stack

| Layer    | Choice                                  |
|----------|-----------------------------------------|
| Build    | Vite 6                                  |
| UI       | React 19 + React Router 7               |
| 3D       | @react-three/fiber + drei + three       |
| Styling  | Tailwind 4 (via the Vite plugin)        |
| Data     | Hardcoded `src/data/projects.js`        |

## STL viewer notes

`STLViewer.jsx` has two paths:

- **Real STL** — if a project has an `stlUrl`, it's loaded via three's
  `STLLoader`. Drop a file into `public/models/` and set the path in
  `projects.js` to use this path.
- **Procedural** — if no `stlUrl`, it renders a composed mesh keyed by the
  project's `geometry` field. Exists so the demo runs zero-setup without
  needing real STL files in the repo.

## About the data

`src/data/projects.js` is a stand-in for a real CMS. The shape is flat and
serialisable on purpose — in production, a sync worker (Notion → R2 →
`projects.json`) would emit the same shape and the frontend wouldn't change.
See the challenge-response notes for more on that architecture.
