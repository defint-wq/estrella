import { useState, type FormEvent } from "react";
import { KeyRound, Stethoscope } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../modules/auth/AuthContext";
import {
  pageCardClass,
  pageInputClass,
  primaryButtonClass,
} from "../../modules/app/ui/page";

export const LoginPage = () => {
  const { user, loading, authError, login } = useAuth();
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
      : "/home";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    if (!username.trim()) {
      setError("Нэвтрэх нэрээ оруулна уу.");
      return;
    }
    if (!password) {
      setError("Нууц үгээ оруулна уу.");
      return;
    }

    try {
      await login(username, password);
      navigate(redirectTo, { replace: true });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Нэвтрэхэд алдаа гарлаа.",
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center overflow-y-auto bg-[#FAF8F5] px-5 py-10 text-stone-900">
      <section className={`${pageCardClass} w-full max-w-md p-6 sm:p-8`}>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
            <Stethoscope size={22} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Clinic portal
            </p>
            <p className="mt-1 text-sm font-semibold tracking-tight text-stone-900">
              Эмнэлгийн ажилтны систем
            </p>
          </div>
        </div>
        <h1 className="mt-7 text-2xl font-bold text-stone-900">
          Нэвтрэх
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Ажилтны мэдээлэл болон үзлэгийн хуваариа харахын тулд нэвтэрнэ үү.
        </p>

        {user ? (
          <div className="mt-7 rounded-2xl border border-stone-200 bg-[#FAF8F5] p-5">
            <p className="text-sm text-stone-600">
              Та <strong>{user.username}</strong> нэрээр нэвтэрсэн байна.
            </p>
            <button
              type="button"
              onClick={() => navigate("/home", { replace: true })}
              className={`${primaryButtonClass} mt-4 w-full`}
            >
              Профайл руу үргэлжлүүлэх
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">
                Нэвтрэх нэр
              </span>
              <input
                autoComplete="username"
                autoFocus
                className={pageInputClass}
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
              <span className="mb-2 block text-sm font-semibold text-stone-700">
                Нууц үг
              </span>
              <input
                autoComplete="current-password"
                className={pageInputClass}
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

            {(error || authError) && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800" role="alert">
                {error || authError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`${primaryButtonClass} w-full`}
            >
              <KeyRound size={17} />
              Нэвтрэх
            </button>
            <p className="text-center text-xs leading-5 text-stone-500">
              Нэвтрэх мэдээлэл хамгаалагдсан холболтоор илгээгдэнэ.
            </p>
          </form>
        )}
      </section>
    </main>
  );
};
