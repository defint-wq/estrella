import { useCallback, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useDebouncedValue } from "../../app/hooks/useDebouncedValue";
import { GET_APPOINTMENTS } from "../../patient/graphql/query/appointment";
import type {
  AppointmentStatus,
  AppointmentsQuery,
} from "../../patient/types/patient";

const APPOINTMENTS_PER_PAGE = 10;

export const useHomeAppointments = (
  searchQuery: string,
  status: AppointmentStatus,
) => {
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const {
    data,
    loading: queryLoading,
    error,
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailure, setLoadMoreFailure] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const fetchMoreLock = useRef(false);
  const pageInfo = data?.appointments.pageInfo;
  const hasMore = pageInfo?.hasNextPage ?? false;
  const queryKey = `${debouncedSearch}:${status}`;
  const loadMoreError =
    loadMoreFailure?.key === queryKey ? loadMoreFailure.message : null;

  const loadMore = useCallback(async () => {
    if (!hasMore || queryLoading || fetchMoreLock.current) return;

    fetchMoreLock.current = true;
    setLoadingMore(true);
    setLoadMoreFailure(null);
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
      setLoadMoreFailure({
        key: queryKey,
        message:
          cause instanceof Error
            ? cause.message
            : "Үлдсэн үзлэгүүдийг ачаалж чадсангүй.",
      });
    } finally {
      fetchMoreLock.current = false;
      setLoadingMore(false);
    }
  }, [
    debouncedSearch,
    fetchMore,
    hasMore,
    pageInfo,
    queryKey,
    queryLoading,
    status,
  ]);

  return {
    appointments: data?.appointments.list ?? [],
    loading: queryLoading && !data?.appointments,
    isRefreshing: queryLoading,
    error: data?.appointments ? null : error?.message ?? null,
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore: () => void loadMore(),
  };
};
