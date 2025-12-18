import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import PaystackButton from '../components/PaystackButton.jsx';
import { useAuth } from '../lib/auth.jsx';
import { fetchUsageStatus, FREE_ANALYSIS_LIMIT } from '../lib/usage.js';
import { formatNaira, PREMIUM_PRICE_NGN } from '../lib/payments.js';

export default function Account() {
  const { user } = useAuth();
  const [usageCount, setUsageCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [usageError, setUsageError] = useState('');
  const [paymentInfo, setPaymentInfo] = useState({ text: '', tone: 'info' });

  useEffect(() => {
    if (!user?.uid) return;
    let isMounted = true;
    setIsLoading(true);
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
          setUsageError('Unable to load usage info right now.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  const formattedPrice = formatNaira(PREMIUM_PRICE_NGN);

  async function refreshUsage() {
    if (!user?.uid) return;
    try {
      const updated = await fetchUsageStatus(user.uid);
      setUsageCount(updated.analysesUsed);
      setIsPremium(updated.premium);
      setPaymentInfo({ text: 'Premium activated successfully.', tone: 'success' });
    } catch (error) {
      console.error(error);
      setPaymentInfo({
        text: 'Payment verified, but we could not refresh usage. Please refresh the page.',
        tone: 'warning',
      });
    }
  }

  return (
    <AppShell
      heading="Account"
      subheading="Manage your profile details and track how many resume analyses you have used."
    >
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <dl className="grid gap-8 md:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Email</dt>
            <dd className="mt-1 text-xl font-semibold text-slate-900">{user?.email ?? '-'}</dd>
          </div>

          <div>
            <dt className="text-sm text-slate-500">Analyses used</dt>
            <dd className="mt-1 text-xl font-semibold text-slate-900">
              {isLoading ? 'Loading…' : `${usageCount} / ${FREE_ANALYSIS_LIMIT}`}
            </dd>
            {usageError ? <p className="mt-1 text-xs text-rose-500">{usageError}</p> : null}
          </div>
          <div>
            <dt className="text-sm text-slate-500">Plan</dt>
            <dd className="mt-1 text-xl font-semibold text-slate-900">
              {isPremium ? 'Premium (unlimited)' : 'Free tier'}
            </dd>
          </div>
        </dl>

        {isPremium ? (
          <p className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm font-semibold text-emerald-700">
            Thank you! Premium is active on your account.
          </p>
        ) : (
          <>
            {paymentInfo.text ? (
              <p
                className={`mt-8 text-sm ${
                  paymentInfo.tone === 'success'
                    ? 'text-emerald-600'
                    : paymentInfo.tone === 'warning'
                      ? 'text-amber-600'
                      : 'text-rose-500'
                }`}
                aria-live="polite"
              >
                {paymentInfo.text}
              </p>
            ) : null}
            <PaystackButton
              className="mt-6 w-full"
              userId={user?.uid}
              email={user?.email}
              amount={PREMIUM_PRICE_NGN}
              buttonLabel="Unlock Full Reports"
              onSuccess={refreshUsage}
              onStatusChange={setPaymentInfo}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
