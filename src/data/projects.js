// Hardcoded project data stand-in for a real CMS.
// In production this shape is exactly what a Notion / Airtable sync would normalise into
//
// Each project may optionally have an `stlUrl`. If present, stl or pcb viewer will load it

export const projects = [
  {
    id: 'sensor-board-v22',
    title: 'Sensor Board v22',
    client: 'Undisclosed — Environmental Monitoring',
    year: '2026',
    status: 'Released',
    tags: ['PCB', 'IoT', 'Rev 22', 'Through-hole'],
    summary:
      'A revision-22 sensor breakout rendered straight from the shipped gerbers — top silk, mask, copper, FR4 substrate, and bottom layers. Hover to explode the stack.',
    body: [
      'The 22nd revision of a sensor carrier board we have been iterating on with the client since early 2025. Four-layer footprint collapsed onto a two-layer board to hit a cost target, with the routing effort that implies.',
      'This card uses the real production gerbers, converted at build time into aligned silhouette textures and composed in three.js. The interactive viewer stacks each copper, mask, silk, and substrate layer in 3D — hovering over the board spreads them apart so you can see every layer that goes into the final fabrication.',
      'The same pipeline that produced this view runs unchanged on any board in the backlog: drop the gerbers into the CMS, the build step converts them, the website renders them.',
    ],
    viewer: 'pcb',
    aspect: 1.995,
    stlUrl: null,
    geometry: null,
    cover: { type: 'image', src: '/covers/sensor-board-v22.png' }
  },
  {
    id: 'mux-sensor-board',
    title: 'MUX Sensor Board',
    client: 'Electroworks',
    year: '2026',
    status: 'Prototype',
    tags: ['Electrical', 'Power', 'Embedded', 'Sustainability'],
    summary:
      'A 16-channel analog multiplexer for high-density electrical sub-metering. One board reads sixteen circuits through a single ADC, built to drop retrofit costs below the threshold where per-circuit monitoring starts paying for itself.',
    body: [
      'Electroworks came to us with a brief buried under a dozen existing sub-metering products: instrumenting every circuit in a commercial building should cost less than the copper it measures. The incumbents were pricing themselves out of retrofits — a single floor of an office needs forty-plus channels and nobody was shipping that density at a defensible unit cost.',
      'Our answer was a pair of 8:1 analog multiplexers feeding a single 24-bit sigma-delta ADC, with the sampling loop locked to the mains zero-crossing so readings across channels don\'t drift in phase. Galvanic isolation sits at the input stage — when one monitored circuit faults, the rest keep reporting. The board taps power from the bus it measures, so there\'s no external PSU and no separate wiring run.',
      'In field trial across two floors of the client\'s Bristol office since February. First-week readings track their reference revenue meter inside 1.2% on mixed load — comfortably within sub-metering spec. Full panel deployment is scheduled for Q3 pending a second revision that trims the footprint by another 30%.',
    ],
    stlUrl: '/models/MUX_Sensor_Board_Array.stl',
    viewer: 'stl',
    aspect: 1.995,
    geometry: null,
    cover: { type: 'image', src: '/covers/mux-sensor-board.png' },
},
]

export const getProject = (id) => projects.find((p) => p.id === id)
