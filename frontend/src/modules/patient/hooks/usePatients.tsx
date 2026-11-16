import { useCallback, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useDebouncedValue } from "../../app/hooks/useDebouncedValue";
import { GET_PATIENTS } from "../graphql/query/patient";
import type { PatientsQuery } from "../types/patient";

const PATIENTS_PER_PAGE = 10;

export const usePatients = (searchQuery: string) => {
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const {
    data,
    loading: queryLoading,
    error,
    refetch,
    fetchMore,
  } = useQuery(GET_PATIENTS, {
    variables: {
      page: 1,
      perPage: PATIENTS_PER_PAGE,
      search: debouncedSearch.trim() || null,
    },
    notifyOnNetworkStatusChange: true,
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailure, setLoadMoreFailure] = useState<{
    search: string;
    message: string;
  } | null>(null);
  const fetchMoreLock = useRef(false);
  const pageInfo = data?.patients.pageInfo;
  const hasMore = pageInfo?.hasNextPage ?? false;
  const search = debouncedSearch.trim();
  const loadMoreError =
    loadMoreFailure?.search === search ? loadMoreFailure.message : null;

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
          perPage: PATIENTS_PER_PAGE,
          search: search || null,
        },
        updateQuery: (
          previous,
          { fetchMoreResult },
        ): PatientsQuery => {
          if (!fetchMoreResult) return previous;
          return {
            ...previous,
            patients: {
              ...previous.patients,
              ...fetchMoreResult.patients,
              list: [
                ...previous.patients.list,
                ...fetchMoreResult.patients.list,
              ],
            },
          };
        },
      });
    } catch (cause) {
      setLoadMoreFailure({
        search,
        message:
          cause instanceof Error
            ? cause.message
            : "Үлдсэн үйлчлүүлэгчдийг ачаалж чадсангүй.",
      });
    } finally {
      fetchMoreLock.current = false;
      setLoadingMore(false);
    }
  }, [
    fetchMore,
    hasMore,
    pageInfo,
    queryLoading,
    search,
  ]);

  return {
    patients: data?.patients.list ?? [],
    loading: queryLoading && !data?.patients,
    isRefreshing: queryLoading,
    error,
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore: () => void loadMore(),
    refetch,
  };
};