/**
 * Build: gerber files → aligned silhouette PNGs.
 *
 * Every layer is rendered as a white silhouette on a transparent background,
 * then tinted at runtime by the three.js material. That way the R3F viewer
 * owns all colour/lighting decisions and the PNGs are reusable for any theme.
 *
 * Alignment is the tricky bit. gerber-to-svg emits each file with its own
 * viewBox, sized to that layer's content extent. If we let those through
 * the layers won't line up in 3D because their planes will have different
 * aspect ratios. Fix: render the board outline (GKO) first to get the
 * canonical viewBox, then force every other layer's SVG onto it. Because
 * gerber paths are emitted in absolute coordinates, widening the viewBox
 * just adds empty space around the content — the traces stay put.
 *
 * Empty layers (GBO / GBP on a single-sided assembly) are skipped. The
 * script is idempotent — run `npm run gerbers` to regenerate.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import gerberToSvg from 'gerber-to-svg'
import { Resvg } from '@resvg/resvg-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const GERBER_DIR = path.join(ROOT, 'public', 'gerbers')
const OUT_DIR = path.join(ROOT, 'public', 'layers')

// Layer map — filename suffix → output name. Order is render order in the
// stack (bottom of the board to top), which the viewer reverses if needed.
const LAYERS = [
  { ext: 'GBO', name: 'bottom-silk' },
  { ext: 'GBP', name: 'bottom-paste' },
  { ext: 'GBS', name: 'bottom-mask' },
  { ext: 'GBL', name: 'bottom-copper' },
  { ext: 'GKO', name: 'outline' },
  { ext: 'GTL', name: 'top-copper' },
  { ext: 'GTS', name: 'top-mask' },
  { ext: 'GTP', name: 'top-paste' },
  { ext: 'GTO', name: 'top-silk' },
  { ext: 'XLN', name: 'drill' },
]

const RENDER_WIDTH_PX = 1024

const gerberFiles = fs.readdirSync(GERBER_DIR)

function findFile(ext) {
  return gerberFiles.find((f) => f.toUpperCase().endsWith('.' + ext))
}

function toSvg(filepath, color = '#ffffff') {
  return new Promise((resolve, reject) => {
    gerberToSvg(
      fs.createReadStream(filepath),
      { color, attributes: { color } },
      (err, result) => (err ? reject(err) : resolve(result)),
    )
  })
}

async function main() {
  // Board outline
  const outlinePath = path.join(GERBER_DIR, findFile('GKO'))
  const outlineSvg = await toSvg(outlinePath)
  const [vx, vy, vw, vh] = outlineSvg
    .match(/viewBox="([^"]+)"/)[1]
    .split(/\s+/)
    .map(Number)
  const aspect = vh / vw
  const renderHeight = Math.round(RENDER_WIDTH_PX * aspect)
  console.log(
    `canonical viewBox=${vx} ${vy} ${vw} ${vh}, aspect=${aspect.toFixed(3)}, ` +
      `rendering at ${RENDER_WIDTH_PX}×${renderHeight}`,
  )

  fs.mkdirSync(OUT_DIR, { recursive: true })

  // Convert every layer, force canonical viewBox, rasterize
  const manifest = []
  for (const layer of LAYERS) {
    const filename = findFile(layer.ext)
    if (!filename) {
      console.log(`  ${layer.name.padEnd(14)} (no ${layer.ext} file) skipped`)
      continue
    }
    const filepath = path.join(GERBER_DIR, filename)
    let svg = await toSvg(filepath)

    // Empty layers (near-empty gerber files on single-sided boards) are skipped
    const vbMatch = svg.match(/viewBox="([^"]+)"/)
    if (!vbMatch) {
      console.log(`  ${layer.name.padEnd(14)} (no viewBox)    skipped`)
      continue
    }
    const [, , , w, h] = ['', ...vbMatch[1].split(/\s+/).map(Number)]
    if (!w || !h) {
      console.log(`  ${layer.name.padEnd(14)} (empty)          skipped`)
      continue
    }

    // Force alignment with the board outline

    svg = svg
      .replace(/viewBox="[^"]+"/, `viewBox="${vx} ${vy} ${vw} ${vh}"`)
      .replace(/\s(width|height)="[^"]*"/g, '')

    const resvg = new Resvg(svg, {
      background: 'rgba(0,0,0,0)',
      fitTo: { mode: 'width', value: RENDER_WIDTH_PX },
    })
    const png = resvg.render().asPng()

    const outPath = path.join(OUT_DIR, `${layer.name}.png`)
    fs.writeFileSync(outPath, png)
    manifest.push({ name: layer.name, file: `layers/${layer.name}.png` })
    console.log(
      `  ${layer.name.padEnd(14)} → ${(png.length / 1024).toFixed(1)} KB`,
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
