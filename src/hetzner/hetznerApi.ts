export type Page<T, K extends string> = {
  [k in K]: T[];
};

export type PageMeta = {
  pagination: Pagination;
};

export const FIRST_PAGE = 1;
export const DEFAULT_PER_PAGE = 25;

export type Pagination = {
  page: number;
  per_page: number;
  previous_page: number | null;
  next_page: number | null;
  last_page: number | null;
  total_entries: number | null;
};

export const MAX_REQUEST_PER_HOUR = "RateLimit-Limit";
export const REQUESTS_REMAINING_THIS_PERIOD = "RateLimit-Remaining";
export const PERIOD_RESETS_AT = "RateLimit-Reset"; // epoch seconds
