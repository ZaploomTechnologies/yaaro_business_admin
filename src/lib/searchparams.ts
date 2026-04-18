import { createSearchParamsCache, parseAsBoolean, parseAsInteger, parseAsString } from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(""),
  sortBy: parseAsString.withDefault("createdAt"),
  sortOrder: parseAsString.withDefault("desc"),
  includeDeleted: parseAsBoolean.withDefault(false),
  category: parseAsString.withDefault("all"),
});
