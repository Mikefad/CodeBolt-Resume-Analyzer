import { firestoreAdmin, FieldValue } from './_firebaseAdmin.js';

const PAYSTACK_VERIFY_URL = 'https://api.paystack.co/transaction/verify';

async function verifyWithPaystack(reference, secretKey) {
  const response = await fetch(`${PAYSTACK_VERIFY_URL}/${reference}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.message ?? 'Unable to verify payment with Paystack.';
    throw new Error(message);
  }

  if (!payload?.data) {
    throw new Error('Paystack verification did not include transaction data.');
  }

  return payload.data;
}

async function upsertPaymentDoc(reference, data) {
  const paymentRef = firestoreAdmin.collection('payments').doc(reference);
  const snapshot = await paymentRef.get();

  const base = {
    reference,
    status: data.status,
    amount: data.amount / 100,
    amountKobo: data.amount,
    currency: data.currency,
    email: data.customer?.email ?? data.customer?.customer_code ?? null,
    gatewayResponse: data.gateway_response,
    channel: data.channel,
    paidAt: data.paid_at,
    createdAt: FieldValue.serverTimestamp(),
    raw: {
      plan: data.plan,
      metadata: data.metadata ?? null,
    },
  };

  if (!snapshot.exists) {
    await paymentRef.set(base);
  } else {
    await paymentRef.set(
      {
        ...base,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  return paymentRef;
}

async function activatePremium(userId) {
  const usageRef = firestoreAdmin.collection('usage').doc(userId);
  await usageRef.set(
    {
      premium: true,
      premiumActivatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      response.status(500).json({ error: 'Paystack secret key is not configured.' });
      return;
    }

    const { reference, userId, email, amount } = request.body ?? {};
    if (!reference || !userId || !email) {
      response.status(400).json({ error: 'Missing required fields: reference, userId, email.' });
      return;
    }

    const expectedAmount = Number(amount);
    if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
      response.status(400).json({ error: 'Invalid amount sent for verification.' });
      return;
    }

    const paymentRef = firestoreAdmin.collection('payments').doc(reference);
    const existingPayment = await paymentRef.get();
    if (existingPayment.exists && existingPayment.data()?.status === 'success') {
      await activatePremium(userId);
      response.status(200).json({
        success: true,
        premium: true,
        paymentReference: reference,
        amountPaid: existingPayment.data()?.amount,
        currency: existingPayment.data()?.currency ?? 'NGN',
        email,
        storedAt: paymentRef.path,
        info: 'Payment already processed earlier.',
      });
      return;
    }

    const transaction = await verifyWithPaystack(reference, secretKey);
    if (transaction.status !== 'success') {
      response.status(400).json({ error: 'Payment is not successful yet.', details: transaction.status });
      return;
    }

    const amountPaidKobo = Number(transaction.amount);
    const expectedKobo = Math.round(expectedAmount * 100);
    if (amountPaidKobo < expectedKobo) {
      response.status(400).json({ error: 'Amount paid does not match required charge.' });
      return;
    }

    await upsertPaymentDoc(reference, transaction);

    await activatePremium(userId);

    response.status(200).json({
      success: true,
      premium: true,
      paymentReference: reference,
      amountPaid: amountPaidKobo / 100,
      currency: transaction.currency,
      email,
      storedAt: paymentRef.path,
    });
  } catch (error) {
    console.error('verify-payment error', error);
    response.status(500).json({
      error: 'Could not verify payment. Please try again.',
      details: error?.message ?? 'Unexpected error',
    });
  }
}
