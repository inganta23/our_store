'use client';

import { useRouter } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();

  const handlePrevious = () => {
    if (currentPage > 1) {
      router.push(`?page=${currentPage - 1}`, { scroll: false });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      router.push(`?page=${currentPage + 1}`, { scroll: false });
    }
  };

  const handlePageClick = (page: number) => {
    router.push(`?page=${page}`, { scroll: false });
  };

  // Calculate the range of pages to display
  const pageRange = 2; // Number of pages to show on either side of the current page
  const startPage = Math.max(1, currentPage - pageRange);
  const endPage = Math.min(totalPages, currentPage + pageRange);

  return (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
      >
        Previous
      </button>

      <div className="flex items-center">
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageClick(1)}
              className="px-3 py-1 mx-1 rounded bg-gray-200"
            >
              1
            </button>
            {startPage > 2 && <span className="mx-1">...</span>}
          </>
        )}

        {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
          <button
            key={startPage + index}
            onClick={() => handlePageClick(startPage + index)}
            className={`px-3 py-1 mx-1 rounded ${currentPage === startPage + index ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {startPage + index}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="mx-1">...</span>}
            <button
              onClick={() => handlePageClick(totalPages)}
              className="px-3 py-1 mx-1 rounded bg-gray-200"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
