import { Link } from 'react-router'

export default function ProjectCard({ project }) {
  const cover =
    project.cover ??
    { type: 'gradient', classes: project.coverGradient }

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group relative block overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 transition hover:border-zinc-700 hover:bg-zinc-900/60"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-zinc-900">
        {cover.type === 'image' ? (
          <img
            src={cover.src}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${cover.classes}`} />
        )}

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgb(9,9,11)_85%)]" />

        {/* Top-left year + status label */}
        <div className="absolute top-4 left-4 font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
          {project.year} · {project.status}
        </div>

        {/* Bottom-right arrow badge */}
        <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:border-emerald-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition">
          →
        </div>
      </div>

      {/* Text section below */}
      <div className="p-5">
        <h3 className="text-lg font-medium mb-1 text-zinc-100">{project.title}</h3>
        <p className="text-xs font-mono text-zinc-500 mb-3">{project.client}</p>
        <p className="text-sm text-zinc-400 line-clamp-2">{project.summary}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
