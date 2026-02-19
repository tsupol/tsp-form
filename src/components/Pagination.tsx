import { useMemo } from 'react';
import clsx from 'clsx';
import '../styles/pagination.css';

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="pagination-icon">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="pagination-icon">
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

const ChevronsLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="pagination-icon">
    <polyline points="11 17 6 12 11 7" />
    <polyline points="18 17 13 12 18 7" />
  </svg>
);

const ChevronsRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="pagination-icon">
    <polyline points="13 7 18 12 13 17" />
    <polyline points="6 7 11 12 6 17" />
  </svg>
);

export type PaginationIcons = {
  first?: React.ReactNode;
  previous?: React.ReactNode;
  next?: React.ReactNode;
  last?: React.ReactNode;
};

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  siblingCount?: number;
  showFirstLast?: boolean;
  disabled?: boolean;
  icons?: PaginationIcons;
};

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

const DOTS = '...';

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  size = 'md',
  siblingCount = 1,
  showFirstLast = true,
  disabled = false,
  icons,
}: PaginationProps) => {
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5; // siblingCount + firstPage + lastPage + currentPage + 2*DOTS

    // Case 1: If the number of pages is less than the page numbers we want to show
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots to show, but rights dots to be shown
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);

      return [...leftRange, DOTS, totalPages];
    }

    // Case 3: No right dots to show, but left dots to be shown
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);

      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Case 4: Both left and right dots to be shown
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return range(1, totalPages);
  }, [totalPages, siblingCount, currentPage]);

  const handlePageChange = (page: number | string) => {
    if (page === DOTS || disabled) return;
    if (typeof page === 'number' && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (!disabled && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!disabled && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages < 2) return null;

  return (
    <nav className={clsx('pagination', `pagination-${size}`, className)} aria-label="Pagination">
      <ul className="pagination-list">
        {showFirstLast && (
          <li>
            <button
              type="button"
              className={clsx('pagination-item', 'pagination-nav', (disabled || currentPage === 1) && 'disabled')}
              onClick={() => handlePageChange(1)}
              disabled={disabled || currentPage === 1}
              aria-label="First page"
            >
              {icons?.first ?? <ChevronsLeft />}
            </button>
          </li>
        )}

        <li>
          <button
            type="button"
            className={clsx('pagination-item', 'pagination-nav', (disabled || currentPage === 1) && 'disabled')}
            onClick={handlePrevious}
            disabled={disabled || currentPage === 1}
            aria-label="Previous page"
          >
            {icons?.previous ?? <ChevronLeft />}
          </button>
        </li>

        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === DOTS) {
            return (
              <li key={`dots-${index}`}>
                <span className="pagination-item pagination-dots">...</span>
              </li>
            );
          }

          return (
            <li key={pageNumber}>
              <button
                type="button"
                className={clsx(
                  'pagination-item',
                  'pagination-page',
                  currentPage === pageNumber && 'active',
                  disabled && 'disabled'
                )}
                onClick={() => handlePageChange(pageNumber)}
                disabled={disabled}
                aria-label={`Page ${pageNumber}`}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}

        <li>
          <button
            type="button"
            className={clsx('pagination-item', 'pagination-nav', (disabled || currentPage === totalPages) && 'disabled')}
            onClick={handleNext}
            disabled={disabled || currentPage === totalPages}
            aria-label="Next page"
          >
            {icons?.next ?? <ChevronRight />}
          </button>
        </li>

        {showFirstLast && (
          <li>
            <button
              type="button"
              className={clsx('pagination-item', 'pagination-nav', (disabled || currentPage === totalPages) && 'disabled')}
              onClick={() => handlePageChange(totalPages)}
              disabled={disabled || currentPage === totalPages}
              aria-label="Last page"
            >
              {icons?.last ?? <ChevronsRight />}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

Pagination.displayName = 'Pagination';
