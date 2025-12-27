import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase.js';

export const FREE_ANALYSIS_LIMIT = 3;
export const FREE_CV_LIMIT = 2;

function normalizeUsage(data = {}) {
  return {
    analysesUsed: data.analysesUsed ?? 0,
    cvsUsed: data.cvsUsed ?? 0,
    premium: Boolean(data.premium),
  };
}

async function ensureUsageDoc(userId) {
  const ref = doc(db, 'usage', userId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await setDoc(ref, {
      analysesUsed: 0,
      cvsUsed: 0,
      premium: false,
      updatedAt: serverTimestamp(),
    });
    return normalizeUsage();
  }
  return normalizeUsage(snapshot.data());
}

export async function fetchUsageStatus(userId) {
  return ensureUsageDoc(userId);
}

export async function incrementUsageCount(userId) {
  const ref = doc(db, 'usage', userId);
  await ensureUsageDoc(userId);
  await updateDoc(ref, {
    analysesUsed: increment(1),
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(ref);
  return normalizeUsage(snapshot.data());
}

export async function incrementCvCount(userId) {
  const ref = doc(db, 'usage', userId);
  await ensureUsageDoc(userId);
  await updateDoc(ref, {
    cvsUsed: increment(1),
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(ref);
  return normalizeUsage(snapshot.data());
}

export async function markPremiumLocally(userId) {
  const ref = doc(db, 'usage', userId);
  await ensureUsageDoc(userId);
  await updateDoc(ref, { premium: true, premiumActivatedAt: serverTimestamp() });
  const snapshot = await getDoc(ref);
  return normalizeUsage(snapshot.data());
}
