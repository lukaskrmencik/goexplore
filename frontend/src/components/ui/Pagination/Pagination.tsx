import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

function buildVisiblePageButtons(
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void
): React.ReactNode[] {
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const pages: React.ReactNode[] = [];

    if (startPage > 1) {
        pages.push(
            <button key={1} onClick={() => onPageChange(1)} className="pagination-btn pagination-btn-edge">
                1
            </button>
        );
        if (startPage > 2) {
            pages.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(
            <button
                key={i}
                onClick={() => onPageChange(i)}
                className={`pagination-btn pagination-btn-number ${currentPage === i ? "pagination-btn-number-active" : "pagination-btn-number-inactive"}`}
            >
                {i}
            </button>
        );
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pages.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
        }
        pages.push(
            <button key={totalPages} onClick={() => onPageChange(totalPages)} className="pagination-btn pagination-btn-edge">
                {totalPages}
            </button>
        );
    }

    return pages;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className = "",
}) => {
    if (totalPages <= 1) return null;

    return (
        <div className={`pagination-container ${className}`}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn pagination-btn-arrow"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="pagination-numbers-container">
                {buildVisiblePageButtons(currentPage, totalPages, onPageChange)}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn pagination-btn-arrow"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;
