import AuthForm from '../components/AuthForm.jsx';

export default function Register() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.4),_transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.35),_transparent_40%)]" />
      </div>
      <div className="relative max-w-md flex-1">
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
