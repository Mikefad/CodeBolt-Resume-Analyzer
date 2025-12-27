import { Link } from 'react-router-dom';

const steps = [
  {
    title: 'Upload or paste',
    body: 'Drop in a PDF or paste your resume text. We extract everything client-side for privacy.',
  },
  {
    title: 'AI review + tailored CV',
    body: 'GPT-4o mini analyzes structure, keywords, and clarity and drafts a modern CV aligned to the role.',
  },
  {
    title: 'Actionable roadmap',
    body: 'Score, summary, strengths, weaknesses, and suggested edits are returned instantly.',
  },
];

const personas = [
  {
    title: 'International students',
    body: 'Understand US/EU hiring expectations and avoid common blockers like vague impact or missing keywords.',
  },
  {
    title: 'Junior developers',
    body: 'Surface the right bootcamp projects, hackathons, and internships to get through ATS filters.',
  },
  {
    title: 'Career switchers',
    body: 'Translate transferable experience into a tech-friendly narrative with concrete metrics.',
  },
];

const faqs = [
  {
    q: 'Is CodeBolt really free to start?',
    a: 'Yes. Every account gets three full analyses for free, plus the CV builder to start drafting immediately.',
  },
  {
    q: 'Do I need a perfect resume format?',
    a: 'No. We support PDFs and plain text, and the AI focuses on content quality, clarity, and keywords.',
  },
  {
    q: 'Which roles do you support?',
    a: 'The prompts are optimized for software engineering, product, and data roles aimed at junior and early-career talent.',
  },
  {
    q: 'Will you store my resume?',
    a: 'We temporarily process your text for scoring and suggestions and will later let you delete analyses at any time.',
  },
];

const statHighlights = [
  { label: 'Resumes analyzed', value: '12,400+' },
  { label: 'Avg. score lift', value: '+23 pts' },
  { label: 'Keyword coverage', value: '92%' },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.45),_transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.45),_transparent_40%)]" />
      </div>

      <header className="relative">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-24 pt-20 lg:flex-row lg:items-center">
          <div className="flex-1 text-center lg:text-left">
            <p className="inline-flex items-center rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.3em] text-indigo-100">
              CodeBolt Resume Studio
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              AI resume reviews and tailored CVs for the next wave of international tech talent
            </h1>
            <p className="mt-6 text-lg text-slate-200">
              Get personalized feedback, keyword matching, and a tailored CV draft in under a minute. Built for
              students, junior engineers, and anyone making the jump into tech.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link
                to="/register"
                className="rounded-full bg-white px-10 py-3 text-base font-semibold text-slate-900 shadow-[0_10px_40px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 hover:bg-indigo-50"
              >
                Get Started - Free
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-white/30 px-10 py-3 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                I already have an account
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {statHighlights.map(stat => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur">
              <p className="text-sm font-semibold text-indigo-100">Live preview</p>
              <div className="mt-4 space-y-4 rounded-2xl border border-white/5 bg-white/10 p-4 text-left text-sm text-slate-100">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Score</p>
                  <p className="mt-1 text-4xl font-bold text-white">78 / 100</p>
                  <p className="text-sm text-slate-300">Strong technical depth. Clarify outcomes for impact.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card badge="Strengths" items={['Clear tech stack listing', 'Quantified internship impact']} />
                  <Card badge="Weaknesses" items={['Leadership section missing', 'No target role summary']} />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Keywords</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Cloud', 'Leadership'].map(keyword => (
                      <span key={keyword} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                        {keyword}
                      </span>
                    ))}
                    <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-100">Product sense</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl space-y-24 px-6 py-20">
        <section className="grid gap-8 rounded-4xl border border-white/10 bg-white/5 p-12 text-white backdrop-blur sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-semibold text-white">
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-slate-200">{step.body}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-4xl border border-white/10 bg-white/5 p-10 text-white backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-100">Who it is for</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Built for every early-career story</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {personas.map(persona => (
                <div key={persona.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-lg font-semibold">{persona.title}</h3>
                  <p className="mt-3 text-sm text-slate-200">{persona.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-4xl border border-white/10 bg-white/5 p-10 text-white backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-100">Why students choose CodeBolt</p>
            <ul className="mt-6 space-y-4 text-sm text-slate-200">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Instant AI-powered audit without leaving the browser.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Feedback tuned for visa-sponsored internships and grad roles.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Generate a modern CV draft you can polish in minutes.
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-4xl border border-white/10 bg-white/5 p-10 text-white backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-100">FAQ</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">You have questions — we have answers</h2>
          <dl className="mt-10 space-y-6">
            {faqs.map(item => (
              <div key={item.q} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <dt className="text-base font-semibold text-white">{item.q}</dt>
                <dd className="mt-2 text-sm text-slate-200">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="relative border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-300 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} CodeBolt Resume Studio</p>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-white">
              Login
            </Link>
            <Link to="/register" className="hover:text-white">
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Card({ badge, items }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-300">{badge}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
