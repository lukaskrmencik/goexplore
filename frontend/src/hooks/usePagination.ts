import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

export const usePagination = (defaultPage = 1) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get("page") || String(defaultPage));

    const setPage = useCallback((newPage: number) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);

            if (newPage === 1) {
                newParams.delete("page");
            } else {
                newParams.set("page", String(newPage));
            }

            return newParams;
        });
    }, [setSearchParams]);

    const next = () => setPage(page + 1);
    const prev = () => setPage(Math.max(1, page - 1));

    return { page, setPage, next, prev };
};
