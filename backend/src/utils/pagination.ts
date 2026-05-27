import { Types } from 'mongoose';

export interface PaginationParams {
  cursor?: string;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

export function parsePaginationParams(query: {
  cursor?: string;
  limit?: string;
}): PaginationParams {
  const limit = Math.min(Math.max(parseInt(query.limit || '20', 10) || 20, 1), 100);
  const cursor = query.cursor && Types.ObjectId.isValid(query.cursor) ? query.cursor : undefined;

  return { cursor, limit };
}

export function buildPaginatedResponse<T extends { _id: Types.ObjectId }>(
  data: T[],
  limit: number
): PaginatedResponse<T> {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1]._id.toString() : null;

  return {
    data: items,
    pagination: {
      nextCursor,
      hasMore,
      limit,
    },
  };
}
