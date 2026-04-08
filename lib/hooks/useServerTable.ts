"use client";

import { useEffect, useState } from "react";

export type Column = {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (row: any) => React.ReactNode;
  width?: string;
  renderHeader?: () => React.ReactNode;
};

interface UseServerTableProps {
  endpoint: (args: any) => Promise<{
    data: any[];
    total: number;
    filterOptions?: Record<string, string[]>;
  }>;
  columns: Column[];
  initialSearch?: string;
  initialPage?: number;
  limit?: number;
  deps?: any[];
  disablePagination?: boolean; // dependencies to re-fetch data
}

export function useServerTable({
  endpoint,
  initialSearch = "",
  initialPage = 1,
  limit = 10,
  deps,
  disablePagination = false,
}: UseServerTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | undefined>();
  const [search, setSearch] = useState(initialSearch);
  const [globalFilterOptions, setGlobalFilterOptions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const args: any = {
          page: disablePagination ? 1 : page,
          limit: disablePagination ? 1000 : limit,
          search,
          filters,
          sortKey,
          sortDirection,
        };

        const res = await endpoint(args);
        if (!isMounted) return;

        setData(res.data);
        if (!disablePagination && res.total !== undefined) {
          setTotalPages(Math.ceil(res.total / limit));
        } else {
          setTotalPages(1);
        }

        if (res.filterOptions) setGlobalFilterOptions(res.filterOptions);
      } catch (err) {
        console.error("useServerTable fetch error:", err);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [page, search, filters, sortKey, sortDirection, ...(deps ?? [])]); // deps must be stable primitives

  const clearAll = () => {
    setFilters({});
    setSortKey(undefined);
    setSortDirection(undefined);
    setSearch("");
  };

  return {
    data,
    totalPages,
    page,
    setPage,
    filters,
    setFilters,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
    search,
    setSearch,
    clearAll,
    limit,
    globalFilterOptions,
    setData
  };
}