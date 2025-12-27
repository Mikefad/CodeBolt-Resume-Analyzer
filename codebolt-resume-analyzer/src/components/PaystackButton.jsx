import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { verifyPayment } from '../lib/api.js';
import { formatCurrency } from '../lib/payments.js';

const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v2/inline.js';
const NGN_RATES_ENDPOINT = 'https://open.er-api.com/v6/latest/NGN';
const USER_LOCATION_ENDPOINT = 'https://ipapi.co/json/';
const RATES_TTL_MS = 60 * 60 * 1000;

const REGION_TO_CURRENCY = {
  NG: 'NGN',
  US: 'USD',
  CA: 'CAD',
  GB: 'GBP',
  EU: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  GH: 'GHS',
  KE: 'KES',
  ZA: 'ZAR',
  UG: 'UGX',
  TZ: 'TZS',
  AU: 'AUD',
  NZ: 'NZD',
  JP: 'JPY',
  CN: 'CNY',
  IN: 'INR',
  AE: 'AED',
  SA: 'SAR',
  BR: 'BRL',
  MX: 'MXN',
  SG: 'SGD',
};

let cachedRates = null;
let cachedRatesFetchedAt = 0;
let cachedRatesPromise = null;
let cachedGeoCurrency = null;
let cachedGeoPromise = null;

function usePaystackScript() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.PaystackPop) {
      setStatus('ready');
      return;
    }

    setStatus('loading');
    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = () => setStatus('ready');
    script.onerror = () => {
      setError('Unable to load Paystack payment tools. Check your connection and try again.');
      setStatus('error');
    };
    document.body.appendChild(script);
  }, []);

  return { ready: status === 'ready', loading: status === 'loading', error };
}

async function fetchRates() {
  const now = Date.now();
  if (cachedRates && now - cachedRatesFetchedAt < RATES_TTL_MS) {
    return cachedRates;
  }
  if (cachedRatesPromise) return cachedRatesPromise;

  cachedRatesPromise = fetch(NGN_RATES_ENDPOINT)
    .then(async (res) => {
      if (!res.ok) throw new Error('Failed to load conversion rates.');
      const data = await res.json();
      if (data?.result !== 'success' || !data?.rates) throw new Error('Conversion rates unavailable.');
      cachedRates = data.rates;
      cachedRatesFetchedAt = Date.now();
      cachedRatesPromise = null;
      return cachedRates;
    })
    .catch((error) => {
      cachedRatesPromise = null;
      throw error;
    });

  return cachedRatesPromise;
}

async function fetchUserCurrencyByIp() {
  if (cachedGeoCurrency) return cachedGeoCurrency;
  if (cachedGeoPromise) return cachedGeoPromise;

  cachedGeoPromise = fetch(USER_LOCATION_ENDPOINT)
    .then(async (res) => {
      if (!res.ok) throw new Error('Failed to detect location.');
      const data = await res.json();
      const region = data?.country_code?.toUpperCase?.();
      const currency = (region && REGION_TO_CURRENCY[region]) || 'NGN';
      cachedGeoCurrency = currency;
      cachedGeoPromise = null;
      return currency;
    })
    .catch((error) => {
      cachedGeoPromise = null;
      throw error;
    });

  return cachedGeoPromise;
}

function detectPreferredCurrency() {
  if (typeof window === 'undefined') {
    return 'NGN';
  }
  const localeCandidate =
    window.navigator?.languages?.[0] || window.navigator?.language || 'en-NG';
  try {
    if (typeof Intl.Locale === 'function') {
      const intlLocale = new Intl.Locale(localeCandidate);
      const region = intlLocale.maximize().region;
      if (region && REGION_TO_CURRENCY[region]) {
        return REGION_TO_CURRENCY[region];
      }
    }
  } catch (error) {
    // ignore and use fallback below
  }

  const localeParts = localeCandidate.split(/[-_]/);
  if (localeParts.length > 1) {
    const region = localeParts[1].toUpperCase();
    if (REGION_TO_CURRENCY[region]) {
      return REGION_TO_CURRENCY[region];
    }
  }
  return 'NGN';
}

export default function PaystackButton({
  userId,
  email,
  amount,
  currency = 'NGN',
  buttonLabel = 'Unlock Full Reports',
  className = '',
  disabled = false,
  onSuccess,
  onError,
  onStatusChange,
}) {
  const { ready, loading, error } = usePaystackScript();
  const [isProcessing, setIsProcessing] = useState(false);
  const [localStatus, setLocalStatus] = useState({ text: '', tone: 'info' });
  const scrollLockedRef = useRef(false);
  const scrollYRef = useRef(0);
  const preferredCurrency = useMemo(detectPreferredCurrency, []);
  const [userCurrency, setUserCurrency] = useState(preferredCurrency);
  const [conversion, setConversion] = useState({
    status: 'loading',
    currency: preferredCurrency,
    value: null,
  });

  const amountKobo = useMemo(() => {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed)) return 0;
    return Math.round(parsed * 100);
  }, [amount]);

  const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  useEffect(() => {
    let isMounted = true;
    fetchUserCurrencyByIp()
      .then((currency) => {
        if (!isMounted) return;
        setUserCurrency(currency);
      })
      .catch(() => {
        if (!isMounted) return;
        setUserCurrency(detectPreferredCurrency());
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!userCurrency || userCurrency === 'NGN') {
      setConversion({ status: 'ready', currency: 'NGN', value: amount });
      return;
    }

    let isMounted = true;
    setConversion({ status: 'loading', currency: userCurrency, value: null });
    fetchRates()
      .then((rates) => {
        if (!isMounted) return;
        const normalized = userCurrency?.toUpperCase?.();
        const rate = rates?.[normalized];
        if (!rate) {
          setConversion({ status: 'error', currency: userCurrency, value: null });
          return;
        }
        setConversion({
          status: 'ready',
          currency: userCurrency,
          value: amount * rate,
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setConversion({ status: 'error', currency: userCurrency, value: null });
      });

    return () => {
      isMounted = false;
    };
  }, [userCurrency, amount]);

  const emitStatus = useCallback(
    (text, tone = 'info') => {
      if (onStatusChange) {
        onStatusChange({ text, tone });
      } else {
        setLocalStatus({ text, tone });
      }
    },
    [onStatusChange],
  );

  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    scrollYRef.current = window.scrollY || window.pageYOffset || 0;
    document.body.dataset.paystackOverflow = document.body.style.overflow;
    document.body.dataset.paystackPosition = document.body.style.position;
    document.body.dataset.paystackTop = document.body.style.top;
    document.body.dataset.paystackWidth = document.body.style.width;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }, []);

  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    scrollLockedRef.current = false;
    const overflow = document.body.dataset.paystackOverflow ?? '';
    const position = document.body.dataset.paystackPosition ?? '';
    const top = document.body.dataset.paystackTop ?? '';
    const width = document.body.dataset.paystackWidth ?? '';
    document.body.style.overflow = overflow;
    document.body.style.position = position;
    document.body.style.top = top;
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = width;
    delete document.body.dataset.paystackOverflow;
    delete document.body.dataset.paystackPosition;
    delete document.body.dataset.paystackTop;
    delete document.body.dataset.paystackWidth;
    const scrollY = scrollYRef.current;
    window.scrollTo({ top: scrollY, behavior: 'auto' });
  }, []);

  const handleClick = useCallback(() => {
    if (!userId || !email) {
      emitStatus('Missing account details. Please sign in again.', 'warning');
      onError?.(new Error('Missing account info'));
      return;
    }

    if (!paystackKey) {
      emitStatus('Paystack key is not configured. Please contact support.', 'warning');
      onError?.(new Error('Missing Paystack key'));
      return;
    }

    if (!ready || !window.PaystackPop) {
      emitStatus('Payment tools are still loading. Please try again in a moment.', 'info');
      return;
    }

    if (!amountKobo || amountKobo < 10000) {
      emitStatus('Invalid payment amount configured.', 'warning');
      return;
    }

    setIsProcessing(true);

    const reference = `CB-${userId}-${Date.now()}`;

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email,
      amount: amountKobo,
      currency,
      ref: reference,
      label: 'CodeBolt Resume Studio',
      metadata: {
        custom_fields: [
          {
            display_name: 'User ID',
            variable_name: 'user_id',
            value: userId,
          },
        ],
      },
      callback: async (response) => {
        try {
          const verification = await verifyPayment({
            reference: response.reference,
            userId,
            email,
            amount,
          });
          emitStatus('Payment verified. Premium unlocked!', 'success');
          onSuccess?.(verification);
        } catch (err) {
          console.error(err);
          const friendly = err?.message ?? 'Unable to verify payment. Please contact support.';
          emitStatus(friendly, 'warning');
          onError?.(err);
        } finally {
          setIsProcessing(false);
          unlockScroll();
        }
      },
      onClose: () => {
        setIsProcessing(false);
        emitStatus('Payment cancelled before completion.', 'info');
        unlockScroll();
      },
    });

    handler.openIframe();
    lockScroll();
  }, [amount, amountKobo, currency, email, emitStatus, lockScroll, onError, onSuccess, paystackKey, ready, unlockScroll, userId]);

  useEffect(() => {
    if (error) emitStatus(error, 'warning');
  }, [emitStatus, error]);

  useEffect(() => () => {
    unlockScroll();
  }, [unlockScroll]);

  const displayCurrency =
    conversion.status === 'ready' && conversion.value ? conversion.currency : 'NGN';
  const displayAmount =
    conversion.status === 'ready' && conversion.value ? conversion.value : amount;

  const buttonState = isProcessing
    ? 'Verifying payment…'
    : loading
      ? 'Loading Paystack…'
      : `${buttonLabel} – ${formatCurrency(displayAmount, displayCurrency)}`;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing || loading || !ready}
        className={`rounded-2xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      >
        {buttonState}
      </button>
      {!onStatusChange && localStatus.text ? (
        <p
          className={`text-sm ${
            localStatus.tone === 'success'
              ? 'text-emerald-600'
              : localStatus.tone === 'warning'
                ? 'text-amber-600'
                : 'text-slate-500'
          }`}
          aria-live="polite"
        >
          {localStatus.text}
        </p>
      ) : null}
    </div>
  );
}
