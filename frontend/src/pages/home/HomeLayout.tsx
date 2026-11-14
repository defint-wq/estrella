import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { CalendarDays, Search } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { PageContainer, PageContent } from "../../modules/app/ui/page";
import { useDebouncedValue } from "../../modules/app/hooks/useDebouncedValue";
import { GET_APPOINTMENTS } from "../../modules/patient/graphql/query/appointment";
import type { AppointmentsQuery } from "../../modules/patient/types/patient";
import { ConsultationForm } from "../../components/ConsultationForm";
import { InfiniteScrollTrigger } from "../../components/InfiniteScrollTrigger";
import type { DashboardAppointment, HomeOutletContext } from "./types";

const APPOINTMENTS_PER_PAGE = 10;

const tabClassName = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
    isActive
      ? "bg-white text-[#514a40] shadow-sm"
      : "text-[#89847b] hover:bg-white/70 hover:text-[#514a40]"
  }`;

export const HomeLayout = () => {
  const [selectedAppointment, setSelectedAppointment] =
    useState<DashboardAppointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const status = location.pathname.endsWith("/completed")
    ? "COMPLETED"
    : "SCHEDULED";
  const {
    data,
    loading: queryLoading,
    error,
    refetch,
    fetchMore,
  } = useQuery(GET_APPOINTMENTS, {
    variables: {
      page: 1,
      perPage: APPOINTMENTS_PER_PAGE,
      search: debouncedSearch.trim() || null,
      status,
    },
    notifyOnNetworkStatusChange: true,
  });
  const appointments: DashboardAppointment[] = data?.appointments.list ?? [];
  const pageInfo = data?.appointments.pageInfo;
  const hasMore = pageInfo?.hasNextPage ?? false;
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const fetchMoreLock = useRef(false);

  useEffect(() => {
    setLoadMoreError(null);
  }, [debouncedSearch, status]);

  const loadMore = useCallback(async () => {
    if (!hasMore || queryLoading || fetchMoreLock.current) return;

    fetchMoreLock.current = true;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const currentPage = pageInfo?.currentPage ?? 1;
      await fetchMore({
        variables: {
          page: currentPage + 1,
          perPage: APPOINTMENTS_PER_PAGE,
          search: debouncedSearch.trim() || null,
          status,
        },
        updateQuery: (
          previous,
          { fetchMoreResult },
        ): AppointmentsQuery => {
          if (!fetchMoreResult) return previous;
          return {
            ...previous,
            appointments: {
              ...previous.appointments,
              ...fetchMoreResult.appointments,
              list: [
                ...previous.appointments.list,
                ...fetchMoreResult.appointments.list,
              ],
            },
          };
        },
      });
    } catch (cause) {
      setLoadMoreError(
        cause instanceof Error
          ? cause.message
          : "Үлдсэн үзлэгүүдийг ачаалж чадсангүй.",
      );
    } finally {
      fetchMoreLock.current = false;
      setLoadingMore(false);
    }
  }, [
    debouncedSearch,
    fetchMore,
    hasMore,
    pageInfo?.currentPage,
    queryLoading,
    status,
  ]);
  const handleLoadMore = useCallback(() => {
    void loadMore();
  }, [loadMore]);

  const outletContext: HomeOutletContext = {
    appointments,
    loading: queryLoading && !data?.appointments,
    error: data?.appointments ? null : error?.message ?? null,
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
              <h1 className="text-xl font-bold leading-tight tracking-[-0.04em] text-[#36342f] sm:text-2xl">
                Үзлэгийн жагсаалт
              </h1>
            </div>
          </div>

          <label className="mt-5 flex h-12 items-center gap-2.5 rounded-xl border border-[#e8e3db] bg-white px-4 text-[#9c968d] transition focus-within:border-[#ad9272] focus-within:ring-4 focus-within:ring-[#ad9272]/10">
            <Search size={16} className="shrink-0" />
            <input
              type="search"
              aria-label="Үзлэг хайх"
              placeholder="Үйлчлүүлэгч, регистр, эмч эсвэл оношоор хайх..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
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

        <InfiniteScrollTrigger
          hasMore={hasMore}
          loading={queryLoading || loadingMore}
          error={loadMoreError}
          onLoadMore={handleLoadMore}
        />

        {selectedAppointment && (
          <ConsultationForm
            key={selectedAppointment._id}
            appointment={selectedAppointment}
            patientName={selectedAppointment.patientName}
            registrationNumber={selectedAppointment.registrationNumber}
            onClose={() => setSelectedAppointment(null)}
            onSaved={() => void refetch()}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};
