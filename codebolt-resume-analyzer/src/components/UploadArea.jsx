import { useRef } from 'react';

const formatSize = bytes => {
  if (!Number.isFinite(bytes)) {
    return 'Unknown size';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function UploadArea({
  selectedFile,
  onFileSelected,
  onRemoveFile,
  resumeText,
  onTextChange,
  isExtracting,
  error,
  jobTitle,
  jobDescription,
  onJobTitleChange,
  onJobDescriptionChange,
  onAnalyze,
  isAnalyzing,
  disabled,
  usageCount,
  isPremium,
  usageLimit,
  isUsageLoading,
}) {
  const fileInputRef = useRef(null);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Upload or paste resume</h2>
          <p className="mt-1 text-sm text-slate-500">
            Supports PDF uploads (we extract the text in-browser) or manual text entry as a fallback.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-indigo-200 hover:text-indigo-600"
        >
          Choose PDF
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="mt-6 flex h-52 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm text-slate-500">
        {selectedFile ? (
          <>
            <p className="text-base font-semibold text-slate-800">{selectedFile.name}</p>
            <p className="mt-1 text-xs text-slate-500">{formatSize(selectedFile.size)}</p>
            <button
              type="button"
              className="mt-4 text-sm font-semibold text-rose-500 hover:underline"
              onClick={onRemoveFile}
            >
              Remove file
            </button>
          </>
        ) : (
          <>
            <p className="font-medium text-slate-600">Drag & drop your resume PDF here</p>
            <p className="mt-2 text-xs text-slate-500">We will automatically extract the text for analysis.</p>
          </>
        )}
        {isExtracting ? (
          <p className="mt-4 text-xs font-medium text-indigo-600">Extracting text from PDF...</p>
        ) : null}
        {error ? (
          <p className="mt-4 text-xs font-semibold text-rose-500">{error}</p>
        ) : null}
      </div>

      <label htmlFor="resume-text" className="mt-6 block text-sm font-medium text-slate-700">
        Or paste resume text
      </label>
      <textarea
        id="resume-text"
        className="mt-2 h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        placeholder="Paste your full resume content here..."
        value={resumeText}
        onChange={event => onTextChange(event.target.value)}
      />
      <p className="mt-2 text-xs text-slate-500">{resumeText.length} characters detected.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="job-title" className="text-sm font-medium text-slate-700">
            Target job title (optional)
          </label>
          <input
            id="job-title"
            type="text"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="e.g., Frontend Engineer"
            value={jobTitle}
            onChange={event => onJobTitleChange(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="job-description" className="text-sm font-medium text-slate-700">
            Job description keywords (optional)
          </label>
          <input
            id="job-description"
            type="text"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="Paste key responsibilities or technologies"
            value={jobDescription}
            onChange={event => onJobDescriptionChange(event.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={disabled || isAnalyzing}
        className="mt-6 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
      </button>
      <p className="mt-2 text-xs text-slate-500">
        {isUsageLoading
          ? 'Checking your remaining free analyses...'
          : isPremium
            ? 'Premium unlocked: enjoy unlimited analyses.'
            : `Free analyses used: ${usageCount}/${usageLimit}.`}
      </p>
      {!isPremium && usageCount >= usageLimit ? (
        <p className="mt-1 text-xs font-semibold text-rose-500">
          You have used all free analyses. Upgrade to unlock full reports.
        </p>
      ) : null}
    </section>
  );
}
