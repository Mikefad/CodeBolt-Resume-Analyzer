import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import UploadArea from '../components/UploadArea.jsx';
import AnalysisResult from '../components/AnalysisResult.jsx';
import PaystackButton from '../components/PaystackButton.jsx';
import { extractTextFromPdf } from '../lib/pdf.js';
import { analyzeResume } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import {
  fetchUsageStatus,
  incrementUsageCount,
  FREE_ANALYSIS_LIMIT,
} from '../lib/usage.js';
import { formatNaira, PREMIUM_PRICE_NGN } from '../lib/payments.js';

const summarizeText = text => {
  if (!text) {
    return { wordCount: 0, charCount: 0, preview: '' };
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  return {
    wordCount: words.length,
    charCount: text.length,
    preview: text.slice(0, 400),
  };
};

export default function Dashboard() {
  const { user } = useAuth();

  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  const [usageCount, setUsageCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [isUsageLoading, setIsUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState({ text: '', tone: 'info' });

  useEffect(() => {
    if (!user?.uid) return;
    let isMounted = true;
    setIsUsageLoading(true);

    fetchUsageStatus(user.uid)
      .then(({ analysesUsed, premium }) => {
        if (isMounted) {
            setUsageCount(analysesUsed);
            setIsPremium(premium);
          setUsageError('');
        }
      })
      .catch(error => {
        console.error(error);
        if (isMounted) {
          setUsageError('Unable to load usage info. You can still try analyzing your resume.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsUsageLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  async function handleFileSelected(file) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported right now. Please convert your resume to PDF or paste the text.');
      return;
    }

    setSelectedFile(file);
    setUploadError('');
    setIsExtracting(true);

    try {
      const extractedText = await extractTextFromPdf(file);
      if (!extractedText) {
        setUploadError('Could not extract text from this PDF. Please paste your resume manually.');
      } else {
        setResumeText(extractedText);
      }
    } catch (error) {
      console.error(error);
      setUploadError('Something went wrong while reading the PDF. Please paste the resume text instead.');
    } finally {
      setIsExtracting(false);
    }
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setUploadError('');
  }

  async function handleAnalyze() {
    if (isUsageLoading) {
      setAnalysisError('Checking your remaining free analyses. Please try again in a moment.');
      return;
    }

    if (!isPremium && usageCount >= FREE_ANALYSIS_LIMIT) {
      setAnalysisError('You have used all free analyses. Unlock full reports for unlimited access.');
      return;
    }

    if (!resumeText || resumeText.trim().length < 200) {
      setAnalysisError('Please provide at least a few sentences of resume content before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError('');
    try {
      const result = await analyzeResume({
        resumeText,
        jobTitle: jobTitle || undefined,
        jobDescription: jobDescription || undefined,
        userId: user?.uid,
      });
      setAnalysis(result);

      if (user?.uid && !isPremium) {
        try {
          const updated = await incrementUsageCount(user.uid);
          setUsageCount(updated.analysesUsed);
          setIsPremium(updated.premium);
        } catch (usageUpdateError) {
          console.error('Failed to update usage', usageUpdateError);
        }
      }
    } catch (error) {
      console.error(error);
      setAnalysisError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const textStats = useMemo(() => summarizeText(resumeText), [resumeText]);
  const hasFreeQuota = usageCount < FREE_ANALYSIS_LIMIT;
  const showPaywall = !isPremium && !hasFreeQuota;

  const upgradePrice = PREMIUM_PRICE_NGN;
  const formattedPrice = formatNaira(upgradePrice);

  async function refreshUsageAfterPayment() {
    if (!user?.uid) return;
    try {
      setPaymentMessage({ text: 'Payment verified. Updating your premium status...', tone: 'info' });
      const updated = await fetchUsageStatus(user.uid);
      setUsageCount(updated.analysesUsed);
      setIsPremium(updated.premium);
      setPaymentMessage({ text: 'Premium unlocked! Enjoy unlimited detailed reports.', tone: 'success' });
    } catch (error) {
      console.error(error);
      setPaymentMessage({
        text: 'Payment verified, but we could not refresh usage automatically. Please reload the page.',
        tone: 'warning',
      });
    }
  }

  return (
    <AppShell
      heading="Resume Analyzer"
      subheading="Upload your resume on the left, add optional job context, then run the AI analysis."
    >
      <div className="grid gap-8 md:grid-cols-2 items-start">
        <UploadArea
          selectedFile={selectedFile}
          onFileSelected={handleFileSelected}
          onRemoveFile={handleRemoveFile}
          resumeText={resumeText}
          onTextChange={text => {
            setResumeText(text);
            setSelectedFile(null);
          }}
          isExtracting={isExtracting}
          error={uploadError}
          jobTitle={jobTitle}
          jobDescription={jobDescription}
          onJobTitleChange={setJobTitle}
          onJobDescriptionChange={setJobDescription}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          disabled={
            !resumeText ||
            resumeText.trim().length < 50 ||
            (!isPremium && usageCount >= FREE_ANALYSIS_LIMIT) ||
            isUsageLoading
          }
          usageCount={usageCount}
          isPremium={isPremium}
          usageLimit={FREE_ANALYSIS_LIMIT}
          isUsageLoading={isUsageLoading}
        />

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resume stats</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <StatBlock label="Words" value={textStats.wordCount} />
              <StatBlock label="Characters" value={textStats.charCount} />
            </div>
            {resumeText ? (
              <p className="mt-4 text-sm text-slate-600">
                Preview: {textStats.preview}
                {resumeText.length > textStats.preview.length ? '…' : ''}
              </p>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Upload a PDF or paste text to see a quick preview.</p>
            )}
            {usageError ? <p className="mt-4 text-xs text-rose-500">{usageError}</p> : null}
          </section>

          {showPaywall ? (
            <section className="rounded-3xl border border-indigo-200 bg-white/90 p-6 shadow-xl shadow-indigo-500/10">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-500">Premium upgrade</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">Unlock unlimited detailed reports</h3>
              <p className="mt-2 text-sm text-slate-600">
                You have used all {FREE_ANALYSIS_LIMIT} free analyses. Make a one-time payment to unlock unlimited
                reports, keyword detection, and upcoming AI upgrades.
              </p>
              <PaystackButton
                className="mt-4 w-full"
                userId={user?.uid}
                email={user?.email}
                amount={upgradePrice}
                buttonLabel="Unlock Full Reports"
                onSuccess={refreshUsageAfterPayment}
                onStatusChange={setPaymentMessage}
              />
              {paymentMessage.text ? (
                <p
                  className={`mt-3 text-sm ${
                    paymentMessage.tone === 'success'
                      ? 'text-emerald-600'
                      : paymentMessage.tone === 'warning'
                        ? 'text-amber-600'
                        : 'text-slate-600'
                  }`}
                  aria-live="polite"
                >
                  {paymentMessage.text}
                </p>
              ) : null}
            </section>
          ) : null}

          <AnalysisResult analysis={analysis} isLoading={isAnalyzing} error={analysisError} />
        </div>
      </div>
    </AppShell>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
