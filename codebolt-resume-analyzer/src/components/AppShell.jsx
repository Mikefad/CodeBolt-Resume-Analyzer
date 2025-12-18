import Navbar from './Navbar.jsx';

export default function AppShell({ children, heading, subheading }) {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,255,0.25),_transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.25),_transparent_40%)]" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          {heading ? (
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">CodeBolt Resume Analyzer</p>
              <h1 className="mt-3 text-3xl font-bold text-white">{heading}</h1>
              {subheading ? <p className="mt-2 text-sm text-slate-300">{subheading}</p> : null}
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
