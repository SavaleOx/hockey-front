interface Props {
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
}

export const Pagination = ({ page, totalPages, onPageChange }: Props) => {
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const left = Math.max(1, page + 1 - delta);
        const right = Math.min(totalPages, page + 1 + delta);
        for (let i = left; i <= right; i++) {
            range.push(i);
        }
        if (left > 2) range.unshift('...');
        if (left > 1) range.unshift(1);
        if (right < totalPages - 1) range.push('...');
        if (right < totalPages) range.push(totalPages);
        return range;
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
            marginBottom: '1rem',
            flexWrap: 'wrap'
        }}>
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
                style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    background: page === 0 ? 'var(--border)' : 'var(--bg-card)',
                    color: page === 0 ? 'var(--text-dark)' : 'var(--accent)',
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                ◀ Назад
            </button>

            {getPageNumbers().map((item, idx) => (
                typeof item === 'number' ? (
                    <button
                        key={idx}
                        onClick={() => onPageChange(item - 1)}
                        style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border)',
                            background: page === item - 1 ? 'var(--accent)' : 'var(--bg-card)',
                            color: page === item - 1 ? 'white' : 'var(--text-dark)',
                            fontWeight: page === item - 1 ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {item}
                    </button>
                ) : (
                    <span key={idx} style={{ padding: '0.4rem 0.4rem', color: 'var(--text-dark)' }}>{item}</span>
                )
            ))}

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages - 1}
                style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    background: page >= totalPages - 1 ? 'var(--border)' : 'var(--bg-card)',
                    color: page >= totalPages - 1 ? 'var(--text-dark)' : 'var(--accent)',
                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                Вперед ▶
            </button>
        </div>
    );
};