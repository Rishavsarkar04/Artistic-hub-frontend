import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/api/client';
import { endpoints } from '@/api/config';
import { createMockTag, mockAdminTags, renameMockTag } from '@/data/admin/tags';
import { deleteMockTag } from '@/data/admin/products';
import type { AdminTag } from '@/types';

/** The tag requests, one per `endpoints.admin.tags` call. */
interface TagRequests {
  list: () => Promise<AdminTag[]>;
  create: (name: string) => Promise<AdminTag>;
  rename: (tagId: number, name: string) => Promise<AdminTag>;
  remove: (tagId: number) => Promise<void>;
}

/** The real API. Errors arrive as `ApiError` (e.g. a 422 with the backend's message when a name is taken). */
const apiTagRequests: TagRequests = {
  list: () => api.get<AdminTag[]>(endpoints.admin.tags.list),
  create: (name) => api.post<AdminTag>(endpoints.admin.tags.create, { name }),
  rename: (tagId, name) => api.put<AdminTag>(endpoints.admin.tags.update(tagId), { name }),
  remove: (tagId) => api.delete<void>(endpoints.admin.tags.delete(tagId)),
};

const mockTagRequests: TagRequests = {
  list: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return mockAdminTags.map((t) => ({ ...t }));
  },
  create: createMockTag,
  rename: renameMockTag,
  remove: deleteMockTag,
};

// MOCK: switch to `apiTagRequests` once the backend serves endpoints.admin.tags. Nothing else changes.
const requests: TagRequests = mockTagRequests;

/**
 * The tag list for a form, shared by every TagPicker on it so a tag added, renamed or deleted in one shows in all.
 * Loads once on mount; each write goes to the server first and updates the list only when it succeeds, so a
 * failed request (thrown as `ApiError`) leaves the list as it was for the caller to show the error.
 */
export function useTagList() {
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let current = true;
    setIsLoading(true);
    setError(null);
    requests
      .list()
      .then((list) => { if (current) setTags(list); })
      .catch((e) => { if (current) setError(e instanceof ApiError ? e : new ApiError(0, 'The tags could not be loaded.')); })
      .finally(() => { if (current) setIsLoading(false); });
    // Ignore a response that arrives after unmount or a newer reload.
    return () => { current = false; };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const create = useCallback(async (name: string) => {
    const tag = await requests.create(name);
    setTags((list) => [...list, tag]);
    return tag;
  }, []);

  const rename = useCallback(async (tagId: number, name: string) => {
    const tag = await requests.rename(tagId, name);
    setTags((list) => list.map((t) => (t.id === tagId ? tag : t)));
    return tag;
  }, []);

  const remove = useCallback(async (tagId: number) => {
    await requests.remove(tagId);
    setTags((list) => list.filter((t) => t.id !== tagId));
  }, []);

  return { tags, isLoading, error, reload, create, rename, remove };
}
