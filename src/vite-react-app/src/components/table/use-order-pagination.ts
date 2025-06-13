
export function useOrderPagination<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
) {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  return {
    currentItems,
    totalPages,
    currentPage,
    totalItems: items.length,
    itemsPerPage,
  };
}
