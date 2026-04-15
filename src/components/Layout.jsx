import { Link, Outlet } from 'react-router'

export default function Layout() {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-900/80 sticky top-0 z-20 backdrop-blur bg-zinc-950/80">
        <div className="w-full px-6 py-4 flex items-center justify-between">
            <Link to="/" aria-label="Hard Stuff — Home" className="group block">
             <img
               src="/HS_logo.svg"
               alt="Hard Stuff"
               className="h-7 w-auto transition-transform group-hover:scale-105"
             />
            </Link>
          <nav className="flex items-center gap-6 text-xs font-mono text-zinc-400">
            <a href="#" className="hover:text-zinc-100 transition">about</a>
            <a href="#" className="hover:text-zinc-100 transition">contact</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-900/80 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-6 font-mono text-xs text-zinc-500 flex justify-between">
          <span>© Hard Stuff R&amp;D</span>
          <span>demo build · v0.1</span>
        </div>
      </footer>
    </div>
  )
}
