export async function analyzeResume(payload) {
  const response = await fetch('/api/analyzeResume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error ?? 'Failed to analyze resume');
  }

  return response.json();
}

export async function verifyPayment(payload) {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error ?? 'Unable to verify payment');
  }

  return response.json();
}
