import { IPaginationQuery, IPaginatedResponse } from '../types';
import { Document, Model, FilterQuery, PopulateOptions } from 'mongoose';

interface PaginateOptions<T> {
  model: Model<T>;
  query: FilterQuery<T>;
  paginationQuery: IPaginationQuery;
  populate?: string | PopulateOptions | (string | PopulateOptions)[];
  select?: string;
  sort?: Record<string, 1 | -1>;
}

export const paginate = async <T extends Document>({
  model,
  query,
  paginationQuery,
  populate,
  select,
  sort,
}: PaginateOptions<T>): Promise<IPaginatedResponse<T>> => {
  const page = Math.max(1, paginationQuery.page || 1);
  const limit = Math.min(100, Math.max(1, paginationQuery.limit || 10));
  const skip = (page - 1) * limit;

  const sortOrder: Record<string, 1 | -1> = sort || {
    [paginationQuery.sort || 'createdAt']: paginationQuery.order === 'asc' ? 1 : -1,
  };

  const [data, total] = await Promise.all([
    model
      .find(query)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .populate(populate as string)
      .select(select || ''),
    model.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

export const parsePaginationQuery = (query: Record<string, string>): IPaginationQuery => ({
  page: parseInt(query.page) || 1,
  limit: parseInt(query.limit) || 10,
  sort: query.sort || 'createdAt',
  order: (query.order as 'asc' | 'desc') || 'desc',
  search: query.search || '',
});
