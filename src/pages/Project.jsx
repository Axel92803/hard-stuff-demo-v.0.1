import { useParams, Link, Navigate } from 'react-router'
import { getProject } from '../data/projects'
import STLViewer from '../components/STLViewer'
import PCBViewer from '../components/PCBViewer'

export default function Project() {
  const { id } = useParams()
  const project = getProject(id)

  if (!project) return <Navigate to="/" replace />

  return (
    <article className="max-w-6xl mx-auto px-6 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500 hover:text-zinc-300 mb-8 transition"
      >
        ← back to projects
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3 font-mono text-xs text-zinc-500 mb-3">
          <span>{project.year}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>{project.client}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span className="text-emerald-400">{project.status}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-100 mb-4">
          {project.title}
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">{project.summary}</p>
      </header>

      <div className="h-[520px] mb-12">
        {project.viewer === 'pcb' ? (
          <PCBViewer aspect={project.aspect} />
        ) : (
          <STLViewer stlUrl={project.stlUrl} variant={project.geometry} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-5 text-zinc-300 leading-relaxed">
          {project.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <aside className="space-y-6 text-sm">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
              Artefacts
            </div>
            <ul className="space-y-2 font-mono text-xs text-zinc-400">
              <li className="flex justify-between">
                <span>3d_model.stl</span>
                <span className="text-zinc-600">
                  {project.stlUrl ? 'loaded' : 'procedural'}
                </span>
              </li>
              <li className="flex justify-between">
                <span>pcb.gerber</span>
                <span className="text-zinc-600">—</span>
              </li>
              <li className="flex justify-between">
                <span>renders/</span>
                <span className="text-zinc-600">—</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </article>
  )
}
