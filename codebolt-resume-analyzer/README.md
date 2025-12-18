## no-op commit

## CodeBolt Resume Analyzer

AI-powered resume feedback tailored for international students and early-career technologists. Upload a PDF or paste your resume, add optional job context, and get a structured analysis (score, strengths, weaknesses, keywords, improvements) from OpenAI. Firebase Authentication protects the dashboard, and Firestore tracks a free allowance of three analyses per user.

### Tech Stack

- **Frontend**: React + Vite + Tailwind CSS  
- **Auth / Data**: Firebase Authentication + Firestore  
- **AI**: OpenAI Responses API (GPT‑4o mini) via Vercel serverless functions  
- **Hosting**: Vercel (frontend + API routes in one repo)  

### Features

- Marketing landing page with hero, personas, FAQ, CTA
- Authentication (email/password + Google) using Firebase
- Protected dashboard with usage tracking and account view
- PDF upload (client-side extraction via `pdfjs-dist`) + textarea fallback
- Job title / description context inputs
- `/api/analyzeResume` serverless route calling OpenAI and returning normalized JSON
- Result cards for score, summary, strengths, weaknesses, keywords, improvements
- Firestore usage tracking (3 free analyses)
- Stripe paywall to unlock unlimited detailed reports ($5 one-time)

---

## Getting Started Locally

```bash
git clone <repo-url>
cd codebolt-resume-analyzer
npm install
```

### .env

Copy `.env.example` → `.env` and fill with your Firebase web config:

```ini
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=0:000000000000:web:0000000000000000

OPENAI_API_KEY=sk-***************
```

> Tip: these values live in Firebase Console → Project settings → “Your apps” (Web). Copy them exactly; otherwise Firebase throws `auth/invalid-api-key`.

### Dev servers

```bash
# Terminal 1 – only the serverless API routes
vercel dev --listen 3001

# Terminal 2 – Vite UI (proxying /api -> 3001)
npm run dev
```

Visit `http://localhost:5173`.

---

## Firebase / Firestore Setup

1. Enable **Email/Password** + **Google** providers in Firebase Auth.  
2. Create a Firestore DB (production mode) and use rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usage/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Usage docs live at `/usage/{uid}` with `{ analysesUsed, premium }`.

---

## Stripe + Premium Unlocks
## Paystack + Premium Unlocks

- Paywall button opens the Paystack inline modal (client-only).
- The Paystack callback returns a reference, which we POST to `/api/verify-payment`.
- `/api/verify-payment` calls Paystack's verify endpoint, stores a receipt in Firestore (`payments/{reference}`), and flips `/usage/{uid}` to `{ premium: true }`.
- Re-using an existing reference simply replays the success response (idempotent and safe).

### Environment variables

```
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx          # exposed to the browser
PAYSTACK_SECRET_KEY=sk_test_xxx              # serverless functions only

FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> Generate Paystack keys in the Paystack dashboard (Test mode). Service Account values live in Firebase Console → Project settings → Service accounts → "Generate new private key".

### Local payments workflow

```bash
vercel dev --listen 3001          # API (verify endpoint)
npm run dev                       # frontend (opens Paystack inline modal)
```

After three free analyses the paywall appears. Clicking "Unlock Full Reports – ₦5,000" launches Paystack; once the modal reports success the verify endpoint talks to Paystack, records the payment, and premium unlocks instantly (no redirect-only success page required).

---

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build (`dist/`) |
| `npm run preview` | Preview production build |

> The PDF worker bundle is ~2 MB; Vite warns about chunk size. That's expected for `pdfjs-dist`.

---

## Deployment (Vercel)

1. Push repo to GitHub.
2. Import in Vercel ("Add New → Project"), detect Vite.
3. Set env vars:
   - `VITE_FIREBASE_*`
   - `OPENAI_API_KEY`
   - `VITE_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`
   - `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`
4. Deploy - Vercel runs `npm install`, `npm run build`, serves `dist/` + `/api/*`.
5. (Optional) configure Paystack dashboard webhooks if you want an extra notification trail.

---
---

## Roadmap Ideas

- Export/share analysis report as PDF
- Enhanced ATS scoring (match resume vs job description)
- Collaborative workspace for mentors / reviewers
- Improved chunking for huge resumes (section batching)
- Paid tier add-ons (credits, team billing)

Contributions welcome! Open an issue or PR with context. Happy resume hacking 🎯
