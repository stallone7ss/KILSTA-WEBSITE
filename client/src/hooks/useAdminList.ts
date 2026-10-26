import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, apiGet, buildQuery } from '../lib/api';

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

interface PagedState<T> {
  items: T[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

export interface AdminListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  category?: string;
  published?: string;
  courseId?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  action?: string;
  entityType?: string;
}

/** List loader shared by the admin tables (search, filters, pagination). */
export function useAdminList<T>(path: string, params: AdminListParams) {
  const [state, setState] = useState<PagedState<T>>({
    items: [],
    total: 0,
    totalPages: 1,
    loading: true,
    error: null
  });
  const [version, setVersion] = useState(0);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const query = buildQuery({ ...paramsRef.current } as Record<string, string | number | boolean | undefined>);
    setState((current) => ({ ...current, loading: true, error: null }));

    apiGet<T[]>(`${path}${query}`, { auth: true, signal: controller.signal })
      .then((response) => {
        if (!active) return;
        const meta = response.meta as
          | { total?: number; totalPages?: number }
          | undefined;
        setState({
          items: response.data,
          total: meta?.total ?? response.data.length,
          totalPages: meta?.totalPages ?? 1,
          loading: false,
          error: null
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState((current) => ({
          ...current,
          loading: false,
          error:
            error instanceof ApiError
              ? error.message
              : 'The list could not be loaded. Please try again.'
        }));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [path, params.page, params.pageSize, params.search, params.status, params.category, params.published, params.courseId, params.sort, params.order, params.action, params.entityType, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return { ...state, reload };
}
