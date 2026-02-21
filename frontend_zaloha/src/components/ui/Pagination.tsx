import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className = ""
}) => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // Max visible page numbers usually

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // First Page
        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => onPageChange(1)}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors hidden sm:flex"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(<span key="start-ellipsis" className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-300 text-xs hidden sm:flex">...</span>);
            }
        }

        // Visible Pages
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === i
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                >
                    {i}
                </button>
            );
        }

        // Last Page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="end-ellipsis" className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-300 text-xs hidden sm:flex">...</span>);
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => onPageChange(totalPages)}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors hidden sm:flex"
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className={`flex items-center justify-center gap-1 sm:gap-2 ${className}`}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft size={20} />
            </button>

            {/* Mobile helper: Hidden as per user request */}

            <div className="flex items-center gap-1">
                {renderPageNumbers()}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;
