export default function AnalysisResult({ analysis, isLoading, error }) {
  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-600">Analyzing resume...</p>
        <p className="mt-2 text-xs text-slate-500">
          It usually takes less than 10 seconds for the AI to review and produce feedback.
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 shadow-sm">
        <p className="text-sm font-semibold text-rose-600">Something went wrong</p>
        <p className="mt-2 text-sm text-rose-500">{error}</p>
      </section>
    );
  }

  if (!analysis) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Analysis preview</h2>
        <p className="mt-2 text-sm text-slate-500">
          Once you run an analysis, this panel will show the AI-generated score, summary, keywords, strengths, and
          weaknesses.
        </p>
        <div className="mt-6 grid gap-4">
          <PlaceholderCard title="Score" body="0-100 score will appear here" />
          <PlaceholderCard title="Summary" body="A concise summary of the resume's effectiveness." />
          <PlaceholderCard title="Strengths & Weaknesses" body="AI will outline what stands out and what needs work." />
          <PlaceholderCard title="Keywords" body="Matched and missing role-specific keywords will appear here." />
        </div>
      </section>
    );
  }

  const { score, summary, strengths, weaknesses, keywordMatch, improvementSuggestions } = analysis;

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Score</p>
        <p className="mt-2 text-4xl font-bold text-slate-900">{score ?? '—'} / 100</p>
        <p className="mt-1 text-sm text-slate-500">{summary ?? 'No summary provided.'}</p>
      </div>

      <CardList title="Strengths" items={strengths} emptyState="Strengths will appear here once analyzed." />
      <CardList title="Weaknesses" items={weaknesses} emptyState="Weaknesses will appear here once analyzed." />

      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Keyword match</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {keywordMatch?.overallMatchPercent ?? 0}% match
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-500">Matched keywords</p>
            <TagList items={keywordMatch?.matchedKeywords} emptyMessage="None detected yet." />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Missing keywords</p>
            <TagList items={keywordMatch?.missingKeywords} emptyMessage="None detected yet." />
          </div>
        </div>
      </div>

      <CardList
        title="Improvement suggestions"
        items={improvementSuggestions}
        emptyState="Actionable bullet points will appear once we run the AI analysis."
      />
    </section>
  );
}

function PlaceholderCard({ title, body }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{body}</p>
    </div>
  );
}

function CardList({ title, items, emptyState }) {
  const hasItems = Array.isArray(items) && items.length > 0;
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{title}</p>
      {hasItems ? (
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
          {items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">{emptyState}</p>
      )}
    </div>
  );
}

function TagList({ items, emptyMessage }) {
  if (!items || items.length === 0) {
    return <p className="mt-1 text-xs text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {items.map(item => (
        <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
          {item}
        </span>
      ))}
    </div>
  );
}
