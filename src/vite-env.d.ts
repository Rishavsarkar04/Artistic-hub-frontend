/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API, without a trailing slash. */
  readonly VITE_API_BASE_URL?: string;
  /** Request timeout in milliseconds. */
  readonly VITE_API_TIMEOUT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
