import { PaginationInfo } from "@/app/shared/types/http";
import { memo } from "react";
import cls from "./Pagination.module.css";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  className?: string;
}

export const Pagination = memo((props: PaginationProps) => {
  const {
    pagination,
    onPageChange,
    onItemsPerPageChange,
    className = "",
  } = props;

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNext,
    hasPrev,
  } = pagination;

  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();
  
  return (
    <div className={cls.Pagination}>
      <div className={cls.Pagination_Controls}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className={cls.Pagination_Button}
        >
          Назад
        </button>
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${cls.Pagination_Button} ${
              currentPage === page ? cls.Pagination_Button_Active : ""
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className={cls.Pagination_Button}
        >
          Вперед
        </button>
      </div>
      {onItemsPerPageChange && (
        <div className={cls.Pagination_Size}>
          <span>На странице:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className={cls.Pagination_Select}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
});

Pagination.displayName = 'Pagination';
