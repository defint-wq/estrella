import { useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { PageContainer, PageContent } from "../app/ui/page";
import { useAuth } from "../auth/AuthContext";
import { useAppointmentCompletion } from "../patient/hooks/useAppointmentCompletion";
import type { AppointmentStatus } from "../patient/types/patient";
import { ConsultationForm } from "../../components/ConsultationForm";
import { InfiniteScrollTrigger } from "../../components/InfiniteScrollTrigger";
import { useHomeAppointments } from "./hooks/useHomeAppointments";
import type { DashboardAppointment, HomeOutletContext } from "./types";

const tabClassName = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
    isActive
      ? "bg-white text-stone-900 shadow-sm"
      : "text-stone-500 hover:bg-white/70 hover:text-stone-900"
  }`;

export const HomePage = () => {
  const [selectedAppointment, setSelectedAppointment] =
    useState<DashboardAppointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const { user } = useAuth();
  const status: AppointmentStatus = location.pathname.endsWith("/completed")
    ? "COMPLETED"
    : "SCHEDULED";
  const appointmentQuery = useHomeAppointments(searchQuery, status);
  const appointmentCompletion = useAppointmentCompletion();

  const outletContext: HomeOutletContext = {
    appointments: appointmentQuery.appointments,
    loading: appointmentQuery.loading,
    error: appointmentQuery.error,
    searchQuery,
    onSelectAppointment: setSelectedAppointment,
  };

  return (
    <PageContainer>
      <PageContent>
        <header className="sticky top-0 z-20 rounded-b-2xl bg-[#FAF8F5]/95 pb-4 pt-2 backdrop-blur-md">
          <div className="flex items-start gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
              <CalendarDays size={20} strokeWidth={1.6} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                <span>Үзлэгийн <span className="text-[#a48663]">жагсаалт</span></span>
              </h1>
            </div>
          </div>

          <label className="mt-4 flex h-11 items-center gap-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] px-4 text-stone-500 transition focus-within:ring-2 focus-within:ring-stone-900">
            <Search size={16} className="shrink-0" />
            <input
              type="search"
              aria-label="Үзлэг хайх"
              placeholder="Үйлчлүүлэгч, регистр, эмч эсвэл оношоор хайх..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
              className="w-full min-w-0 border-0 bg-transparent p-0 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:ring-0"
            />
          </label>

          <nav
            aria-label="Үзлэгийн төлөв"
            className="mt-4 flex w-fit gap-1 rounded-2xl border border-stone-200 bg-stone-100 p-1"
          >
            <NavLink to="pending" className={tabClassName}>
              Үзээгүй
            </NavLink>
            <NavLink to="completed" className={tabClassName}>
              Үзсэн
            </NavLink>
          </nav>
        </header>

        <Outlet context={outletContext} />

        <InfiniteScrollTrigger
          hasMore={appointmentQuery.hasMore}
          loading={appointmentQuery.isRefreshing || appointmentQuery.loadingMore}
          error={appointmentQuery.loadMoreError}
          onLoadMore={appointmentQuery.loadMore}
        />

        {selectedAppointment && (
          <ConsultationForm
            key={selectedAppointment._id}
            appointment={selectedAppointment}
            patientName={selectedAppointment.patientName}
            registrationNumber={selectedAppointment.registrationNumber}
            canEdit={
              user?.role === "ADMIN" ||
              (user?.role === "DOCTOR" &&
                selectedAppointment.doctorId === user._id)
            }
            saving={appointmentCompletion.loading}
            error={appointmentCompletion.error?.message}
            onSave={async (variables) => {
              await appointmentCompletion.completeAppointment(variables);
            }}
            onClose={() => setSelectedAppointment(null)}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};
