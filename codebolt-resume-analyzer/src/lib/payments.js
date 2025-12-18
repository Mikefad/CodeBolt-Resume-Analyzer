export const PREMIUM_PRICE_NGN = 8000;

export function formatCurrency(amount, currency = 'NGN', locale) {
  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(amount);
  } catch (error) {
    const symbol = currency === 'NGN' ? '₦' : `${currency} `;
    return `${symbol}${amount?.toLocaleString?.() ?? amount}`;
  }
}

export function formatNaira(amount) {
  return formatCurrency(amount, 'NGN', 'en-NG');
}
