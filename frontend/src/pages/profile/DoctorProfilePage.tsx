import {
  CalendarDays,
  Clock3,
  DoorOpen,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  PageContainer,
  PageContent,
  PageSubHeader,
  PageTitle,
} from "../../modules/app/ui/page";
import { useAuth } from "../../modules/auth/AuthContext";
import { doctorProfileMock } from "./doctorProfileMock";

const detailCards = [
  {
    label: "Мэргэжил",
    value: doctorProfileMock.specialty,
    icon: Stethoscope,
  },
  { label: "Өрөө", value: doctorProfileMock.room, icon: DoorOpen },
  {
    label: "Ажлын цаг",
    value: doctorProfileMock.workingHours,
    icon: Clock3,
  },
];

export const DoctorProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <PageContainer>
      <PageSubHeader className="sticky top-0 z-20 justify-between bg-[#f7f6f3]/90 py-4">
        <PageTitle
          title="Эмчийн мэдээлэл"
          description="Эмчийн танилцуулга болон үзлэгийн хуваарь."
          className="mb-0"
        />
        {user && (
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e7e1d7] bg-white px-4 py-2.5 text-sm font-semibold text-[#6d655a] transition hover:bg-[#f3f0ea]"
          >
            <LogOut size={16} />
            Гарах
          </button>
        )}
      </PageSubHeader>

      <PageContent>
        <div className="mx-auto w-full max-w-5xl">
          {!user ? (
            <section className="mx-auto mt-8 max-w-xl rounded-3xl border border-[#e9e3d9] bg-white p-7 text-center shadow-[0_12px_40px_rgba(70,58,43,0.06)] sm:mt-12 sm:p-10">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#f3f0ea] text-[#81735f]">
                <LockKeyhole size={24} strokeWidth={1.7} />
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight text-[#39362f]">
                Нэвтэрнэ үү
              </h2>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#928b80]">
                <ShieldCheck size={15} />
                <span>Эмчийн мэдээлэл нууцлалтай</span>
              </div>
              <Link
                to="/auth/login"
                state={{ from: "/profile" }}
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-700 px-5 py-3 text-sm font-bold tracking-wide text-white shadow-sm transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-500/25"
              >
                Нэвтрэх
              </Link>
              <p className="mt-3 text-xs text-[#a19a8f]">
                Нэвтрэлт зөвхөн frontend demo байдлаар ажиллана.
              </p>
            </section>
          ) : (
            <div className="space-y-6">
              <section className="rounded-3xl border border-[#e9e3d9] bg-white p-6 shadow-[0_8px_28px_rgba(70,58,43,0.04)] sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-[#e9e3d9] text-2xl font-semibold text-[#746753]">
                    МЦ
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold tracking-tight text-[#39362f]">
                        {doctorProfileMock.name}
                      </h2>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf2e9] px-3 py-1 text-xs font-semibold text-[#65765a]">
                        <span className="size-1.5 rounded-full bg-[#82936f]" />
                        {doctorProfileMock.scheduleStatus}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#89847b]">
                      {doctorProfileMock.bio}
                    </p>
                  </div>
                </div>
              </section>

              <section
                aria-label="Эмчийн үндсэн мэдээлэл"
                className="grid gap-4 sm:grid-cols-3"
              >
                {detailCards.map(({ label, value, icon: Icon }) => (
                  <article
                    key={label}
                    className="rounded-2xl border border-[#e9e3d9] bg-white p-5"
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#f3f0ea] text-[#81735f]">
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                    <p className="mt-4 text-xs font-medium text-[#989084]">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-[#49443c]">
                      {value}
                    </p>
                  </article>
                ))}
              </section>

              <section className="overflow-hidden rounded-3xl border border-[#e9e3d9] bg-white">
                <div className="flex items-center gap-3 border-b border-[#efebe5] px-6 py-5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#f3f0ea] text-[#81735f]">
                    <CalendarDays size={18} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#39362f]">
                      Долоо хоногийн хуваарь
                    </h3>
                    <p className="mt-0.5 text-xs text-[#989084]">
                      Үзлэгийн цагийн мэдээлэл
                    </p>
                  </div>
                </div>
                <ul className="divide-y divide-[#f1eee8] px-6">
                  {doctorProfileMock.schedule.map(({ day, hours }) => (
                    <li
                      key={day}
                      className="flex items-center justify-between gap-4 py-4 text-sm"
                    >
                      <span className="font-medium text-[#5b554c]">{day}</span>
                      <span
                        className={
                          hours === "Амралтын өдөр"
                            ? "text-[#a19a8f]"
                            : "font-medium text-[#746753]"
                        }
                      >
                        {hours}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
};
