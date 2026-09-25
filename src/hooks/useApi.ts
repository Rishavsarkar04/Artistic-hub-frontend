import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { api, ApiError } from '@/api/client';

type Params = Record<string, string | number | boolean | null | undefined>;

const toApiError = (e: unknown) => (e instanceof ApiError ? e : new ApiError(0, e instanceof Error ? e.message : 'Something went wrong'));

/**
 * Loads data with GET when the component mounts and whenever `url` or `params` change.
 * Pass `null` as the url to skip the request (e.g. until an id is known).
 *
 *   const { data: product, isLoading, error } = useApiQuery<Product>(endpoints.products.detail(id));
 */
export function useApiQuery<T>(url: string | null, params?: Params) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(url !== null);
  const [reloadKey, setReloadKey] = useState(0);
  // Params usually arrive as a new object each render; compare by value.
  const paramsKey = JSON.stringify(params ?? {});

  useEffect(() => {
    if (url === null) {
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    api
      .get<T>(url, { params: JSON.parse(paramsKey) as Params, signal: controller.signal })
      .then(setData)
      .catch((e) => { if (!axios.isCancel(e)) setError(toApiError(e)); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    // Cancel the request if the component unmounts or the url/params change first.
    return () => controller.abort();
  }, [url, paramsKey, reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);
  return { data, error, isLoading, refetch };
}

/**
 * Runs a create/update/delete request on demand, tracking loading and error state.
 * `mutate` never throws (read `error` instead); `mutateAsync` throws, for try/catch flows.
 *
 *   const login = useApiMutation((body: LoginBody) => api.post<LoginResponse>(endpoints.auth.login, body));
 *   <Button loading={login.isLoading} onClick={() => login.mutate({ email, password })} />
 */
export function useApiMutation<TResult, TInput = void>(request: (input: TInput) => Promise<TResult>) {
  const [data, setData] = useState<TResult | undefined>(undefined);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Keep the latest request function without making callers memoise it.
  const requestRef = useRef(request);
  requestRef.current = request;
  // Skip state updates if the request finishes after the component has gone. Set to true in the
  // effect too: StrictMode mounts, unmounts and re-mounts in development, and the re-mount must undo the cleanup.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const mutateAsync = useCallback(async (input: TInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await requestRef.current(input);
      if (mounted.current) setData(result);
      return result;
    } catch (e) { 
      const err = toApiError(e);
      if (mounted.current) setError(err);
      throw err;
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  const mutate = useCallback((input: TInput) => mutateAsync(input).catch(() => undefined), [mutateAsync]);
  const reset = useCallback(() => { setData(undefined); setError(null); }, []);

  return { mutate, mutateAsync, data, error, isLoading, reset };
}
