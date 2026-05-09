interface Props {
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
}
export const Pagination = ({ page, totalPages, onPageChange }: Props) => (
    <div className="flex gap-2 mt-4">
        <button disabled={page === 0} onClick={() => onPageChange(page - 1)} className="px-3 py-1 border">Previous</button>
        <span>Page {page + 1} of {totalPages}</span>
        <button disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)} className="px-3 py-1 border">Next</button>
    </div>
);