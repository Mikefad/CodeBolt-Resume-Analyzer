import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase.js';

const titles = {
  login: 'Welcome back',
  register: 'Create your free account',
};

const subtitles = {
  login: 'Sign in to access the dashboard and start analyzing resumes.',
  register: 'No credit card required - get three AI-powered resume reviews for free.',
};

export default function AuthForm({ mode = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message ?? 'Google sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const alternateLink = mode === 'login' ? '/register' : '/login';
  const alternateLabel = mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in';

  return (
    <div className="relative mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl backdrop-blur">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">{titles[mode]}</h1>
        <p className="text-sm text-slate-200">{subtitles[mode]}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-200">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            value={email}
            onChange={event => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-200">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="Enter a secure password"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            value={password}
            onChange={event => setPassword(event.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-white px-4 py-3 text-base font-semibold text-slate-900 shadow-[0_10px_40px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.2 32 29 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1 7.4 2.8l5.7-5.7C34.6 7.1 29.6 5 24 5 12.4 5 3 14.4 3 26s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.4 15.8 18.8 13 24 13c2.8 0 5.4 1 7.4 2.8l5.7-5.7C34.6 7.1 29.6 5 24 5c-7.9 0-14.6 4.5-17.7 11.1z" />
            <path fill="#4CAF50" d="M24 47c5.4 0 10.3-2.1 14-5.4l-6.5-5.5c-2 1.5-4.6 2.4-7.5 2.4-5 0-9.2-3.2-10.8-7.6l-6.6 5.1C11.6 42.5 17.3 47 24 47z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.4 5.8-6.4 7.4l.1.1 6.5 5.5c-.5.4 7.5-5.5 7.5-15.5 0-1.2-.1-2.4-.4-3.5z" />
          </svg>
          Continue with Google
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
        <p className="font-semibold uppercase tracking-[0.3em] text-slate-300">Why CodeBolt</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Three free analyses with smart usage tracking.</li>
          <li>Optimized prompts for international students applying abroad.</li>
          <li>No PDFs leave your browser until you run the analysis.</li>
        </ul>
      </div>

      <p className="mt-6 text-center text-sm text-slate-300">
        <Link to={alternateLink} className="font-semibold text-indigo-200 hover:underline">
          {alternateLabel}
        </Link>
      </p>
    </div>
  );
}
