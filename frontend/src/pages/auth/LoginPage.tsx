import { useState, type FormEvent } from "react";
import { ArrowLeft, KeyRound, Stethoscope } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../modules/auth/AuthContext";

export const LoginPage = () => {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const requestedPath = (
    location.state as { from?: string } | null
  )?.from;
  const redirectTo =
    requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/profile";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim()) {
      setError("Нэвтрэх нэрээ оруулна уу.");
      return;
    }
    if (!password) {
      setError("Нууц үгээ оруулна уу.");
      return;
    }

    login(username);
    navigate(redirectTo, { replace: true });
  };

  return (
    <main className="flex min-h-full items-center justify-center overflow-y-auto bg-[#f7f6f3] px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#e9e3d9] bg-white p-7 shadow-[0_12px_40px_rgba(70,58,43,0.06)] sm:p-9">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#81796d] transition hover:text-[#514a40]"
        >
          <ArrowLeft size={16} />
          Эмчийн мэдээлэл рүү буцах
        </Link>

        <div className="mt-8 flex size-12 items-center justify-center rounded-2xl bg-[#f3f0ea] text-[#81735f]">
          <Stethoscope size={22} strokeWidth={1.8} />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[#39362f]">
          Нэвтрэх
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#89847b]">
          Эмчийн мэдээлэл болон үзлэгийн хуваариа харахын тулд нэвтэрнэ үү.
        </p>

        {user ? (
          <div className="mt-7 rounded-2xl border border-[#e9e3d9] bg-[#faf8f5] p-5">
            <p className="text-sm text-[#5b554c]">
              Та <strong>{user.username}</strong> нэрээр нэвтэрсэн байна.
            </p>
            <button
              type="button"
              onClick={() => navigate("/profile", { replace: true })}
              className="mt-4 w-full rounded-2xl bg-stone-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-500/25"
            >
              Профайл руу үргэлжлүүлэх
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#514a40]">
                Нэвтрэх нэр
              </span>
              <input
                autoComplete="username"
                autoFocus
                className="w-full rounded-xl border border-[#e6e0d6] bg-[#fdfcfb] px-4 py-3 text-sm text-[#39362f] outline-none transition placeholder:text-[#aaa397] focus:border-[#a99b85] focus:ring-4 focus:ring-[#a99b85]/15"
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError(null);
                }}
                placeholder="Нэрээ оруулна уу"
                required
                value={username}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#514a40]">
                Нууц үг
              </span>
              <input
                autoComplete="current-password"
                className="w-full rounded-xl border border-[#e6e0d6] bg-[#fdfcfb] px-4 py-3 text-sm text-[#39362f] outline-none transition placeholder:text-[#aaa397] focus:border-[#a99b85] focus:ring-4 focus:ring-[#a99b85]/15"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(null);
                }}
                placeholder="Нууц үгээ оруулна уу"
                required
                type="password"
                value={password}
              />
            </label>

            {error && (
              <p className="text-sm font-medium text-[#a64f45]" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-700 px-5 py-3 text-sm font-bold tracking-wide text-white shadow-sm transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-500/25"
            >
              <KeyRound size={17} />
              Нэвтрэх
            </button>
            <p className="text-center text-xs leading-5 text-[#a19a8f]">
              Frontend demo: дурын нэвтрэх нэр, нууц үг оруулж үргэлжлүүлнэ.
              Нэвтрэх мэдээлэл backend рүү илгээгдэхгүй.
            </p>
          </form>
        )}
      </section>
    </main>
  );
};
