import { projects } from '../data/projects'
import ProjectCard from '../components/ProjectCard'
import HeroPCB from '../components/HeroPCB'

export default function Home() {
  return (
    <>
      {/*  PCB HERO */}
      <section className="relative w-full h-[78vh] min-h-[620px] max-h-[900px] overflow-hidden bg-[#050507]">
        <div className="absolute inset-0">
          <HeroPCB />
        </div>
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 lg:p-16">
          <div>
            <div className="font-mono text-[10px] md:text-xs text-emerald-400 tracking-[0.2em] uppercase mb-2">
              ◆ Hardware R&amp;D · Est. 2019
            </div>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal tracking-tight text-zinc-200 leading-[1.05] mb-5">
              Build ‧ Break ‧ Repeat
            </h1>
          </div>
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-5xl lg:text-5xl font-light tracking-tight text-zinc-300 leading-[1.05] mb-5">
              <i>We build <br />
              hardware</i>
              <br className="hidden md:block" />{' '}
              <span className="text-zinc-500">that proves the idea.</span>
            </h2>
            <p className="text-sm md:text-base text-zinc-400 max-w-xl leading-relaxed">
              Sustainability, energy, skunkworks. Concept to working
              prototype in weeks.
            </p>
          </div>
        </div>

        {/* bottom fade into the page background */}

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-zinc-950 pointer-events-none" />
      </section>

      {/* PROJECT GRID */}

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <div className="font-mono text-[10px] text-zinc-500 tracking-[0.2em] uppercase mb-2">
              ◇ Selected work
            </div>
            <h2 className="text-2xl md:text-3xl font-medium text-zinc-100">
              A sample of shipped projects
            </h2>
          </div>
          <div className="font-mono text-xs text-zinc-600 hidden md:block">
            {projects.length.toString().padStart(2, '0')} /{' '}
            {projects.length.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>
    </>
  )
}
