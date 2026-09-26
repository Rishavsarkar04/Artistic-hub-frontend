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

export type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Sends a POST/PUT/PATCH/DELETE on demand, tracking loading and error state. The input passed to
 * `mutate` is the request body (for DELETE it's only used to build the url).
 * `url` is a fixed path, or a function that builds it from the input, e.g. to put an id in it.
 * `mutate` never throws (read `error` instead); `mutateAsync` throws, for try/catch flows.
 *
 *   const addAddress = useApiMutation<Address, NewAddress>(endpoints.account.addresses, 'POST');
 *   const deleteAddress = useApiMutation<void, string>((id) => endpoints.account.address(id), 'DELETE');
 *   <Button loading={addAddress.isLoading} onClick={() => addAddress.mutate(form)} />
 */
export function useApiMutation<TResult, TInput = void>(
  url: string | ((input: TInput) => string),
  method: MutationMethod = 'POST',
) {
  const [data, setData] = useState<TResult | undefined>(undefined);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Skip state updates if the request finishes after the component has gone. Set to true in the
  // effect too: StrictMode mounts, unmounts and re-mounts in development, and the re-mount must undo the cleanup.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const mutateAsync = useCallback(
    async (input: TInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const path = typeof url === 'function' ? url(input) : url;
        let result: TResult;
        switch (method) {
          case 'POST':
            result = await api.post<TResult>(path, input);
            break;
          case 'PUT':
            result = await api.put<TResult>(path, input);
            break;
          case 'PATCH':
            result = await api.patch<TResult>(path, input);
            break;
          case 'DELETE':
            result = await api.delete<TResult>(path);
            break;
        }
        if (mounted.current) setData(result);
        return result;
      } catch (e) {
        const err = toApiError(e);
        if (mounted.current) setError(err);
        throw err;
      } finally {
        if (mounted.current) setIsLoading(false);
      }
    },
    [url, method],
  );

  const mutate = useCallback((input: TInput) => mutateAsync(input).catch(() => undefined), [mutateAsync]);
  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
  }, []);

  return { mutate, mutateAsync, data, error, isLoading, reset };
}
