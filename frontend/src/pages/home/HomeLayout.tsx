import { useCallback, useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { CalendarDays, Search } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { PageContainer, PageContent } from "../../modules/app/ui/page";
import { useDebouncedValue } from "../../modules/app/hooks/useDebouncedValue";
import { GET_APPOINTMENTS } from "../../modules/patient/graphql/query/appointment";
import { ConsultationForm } from "../../components/ConsultationForm";
import type { DashboardAppointment, HomeOutletContext } from "./types";

const PATIENTS_PER_PAGE = 100;

const tabClassName = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
    isActive
      ? "bg-white text-[#514a40] shadow-sm"
      : "text-[#89847b] hover:bg-white/70 hover:text-[#514a40]"
  }`;

export const HomeLayout = () => {
  const client = useApolloClient();
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<DashboardAppointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const firstPage = await client.query({
        query: GET_APPOINTMENTS,
        variables: {
          page: 1,
          perPage: PATIENTS_PER_PAGE,
          search: debouncedSearch.trim() || null,
        },
        fetchPolicy: "network-only",
      });
      const appointments: DashboardAppointment[] = [
        ...firstPage.data.appointments.list,
      ];
      const totalPages = Math.max(
        firstPage.data.appointments.pageInfo.totalPages ?? 1,
        1,
      );

      for (let page = 2; page <= totalPages; page += 1) {
        const result = await client.query({
          query: GET_APPOINTMENTS,
          variables: {
            page,
            perPage: PATIENTS_PER_PAGE,
            search: debouncedSearch.trim() || null,
          },
          fetchPolicy: "network-only",
        });
        appointments.push(...result.data.appointments.list);
      }

      const validAppointments = appointments.filter((appointment) =>
        Number.isFinite(new Date(appointment.startTime).getTime()),
      );
      validAppointments.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );

      setAppointments(validAppointments);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Үзлэгийн жагсаалт авахад алдаа гарлаа.",
      );
    } finally {
      setLoading(false);
    }
  }, [client, debouncedSearch]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const outletContext: HomeOutletContext = {
    appointments,
    loading,
    error,
    searchQuery,
    onSelectAppointment: setSelectedAppointment,
  };

  return (
    <PageContainer>
      <PageContent className="pt-0 sm:pt-0 lg:pt-0">
        <header className="sticky top-0 z-20 -mx-5 mb-6 bg-[#f7f6f3]/95 px-5 pb-4 pt-6 backdrop-blur-md sm:-mx-8 sm:px-8 sm:pt-8 lg:-mx-10 lg:px-10 lg:pt-6">
          <div className="flex items-start gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#353a33] text-[#eee8dc] shadow-sm">
              <CalendarDays size={20} strokeWidth={1.6} />
            </div>
            <div>
              <h1 className="text-[25px] font-medium tracking-[-0.04em] text-[#36342f] sm:text-[30px]">
                Үзлэгийн жагсаалт
              </h1>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#89847b]">
                Товлосон болон дууссан үзлэгүүдээ удирдах.
              </p>
            </div>
          </div>

          <label className="mt-5 flex h-11 items-center gap-2.5 rounded-xl border border-[#e8e3db] bg-white px-3.5 text-[#9c968d] transition focus-within:border-[#ad9272] focus-within:ring-4 focus-within:ring-[#ad9272]/10">
            <Search size={16} className="shrink-0" />
            <input
              type="search"
              aria-label="Үзлэг хайх"
              placeholder="Үйлчлүүлэгч, регистр, эмч эсвэл оношоор хайх..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-transparent text-[13px] text-[#37342f] outline-none placeholder:text-[#b7b1a9]"
            />
          </label>

          <nav
            aria-label="Үзлэгийн төлөв"
            className="mt-4 flex w-fit gap-1 rounded-2xl border border-[#ece8e1] bg-[#f1eee8] p-1"
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

        {selectedAppointment && (
          <ConsultationForm
            key={selectedAppointment._id}
            appointment={selectedAppointment}
            patientName={selectedAppointment.patientName}
            registrationNumber={selectedAppointment.registrationNumber}
            onClose={() => setSelectedAppointment(null)}
            onSaved={() => void loadAppointments()}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};
