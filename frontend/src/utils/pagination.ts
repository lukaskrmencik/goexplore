export function buildPageRange(currentPage: number, totalPages: number, radius = 2): number[] {
    let start = Math.max(1, currentPage - radius);
    let end = Math.min(totalPages, currentPage + radius);

    if (end - start < radius * 2) {
        if (start === 1) {
            end = Math.min(totalPages, start + radius * 2);
        } else if (end === totalPages) {
            start = Math.max(1, end - radius * 2);
        }
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
}
