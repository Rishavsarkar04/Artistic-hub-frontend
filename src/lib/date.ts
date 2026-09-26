/** 12 Mar 2026. Dates are ISO `YYYY-MM-DD` strings, read in UTC so they don't shift by a day. */
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
