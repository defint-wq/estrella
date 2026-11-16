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
      ? "bg-white text-stone-900 shadow-sm"
      : "text-stone-500 hover:bg-white/70 hover:text-stone-900"
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
      <PageContent>
        <header className="sticky top-0 z-20 rounded-b-2xl bg-[#FAF8F5]/95 pb-4 pt-2 backdrop-blur-md">
          <div className="flex items-start gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
              <CalendarDays size={20} strokeWidth={1.6} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                Үзлэгийн жагсаалт
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
