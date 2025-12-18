import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.email ? user.email[0]?.toUpperCase() : 'CB';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="border-b border-white/10 bg-slate-950/80 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/dashboard" className="text-lg font-semibold tracking-tight text-white">
          CodeBolt
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-slate-200">
          <Link to="/dashboard" className="transition hover:text-white">
            Dashboard
          </Link>
          <Link to="/account" className="transition hover:text-white">
            Account
          </Link>
          <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Signed in</p>
              <p className="text-xs text-white">{user?.email ?? 'Guest'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
