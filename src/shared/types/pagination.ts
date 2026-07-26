export interface PaginatedResult<T> {
  data: T[];
  page: {
    cursor: string | null;
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;
