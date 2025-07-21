// utils/queryParser.ts
export function parseQuery(query: any) {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
    ...filters
  } = query;

  return {
    skip: (page - 1) * limit,
    take: Number(limit),
    orderBy: { [sortBy]: order },
    where: filters,
  };
}
