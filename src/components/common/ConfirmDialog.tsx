import { createPortal } from 'react-dom';

interface ConfirmProps {
    open: boolean;
    title: string;
    message: string;
    warningText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog = ({ open, title, message, warningText, onConfirm, onCancel }: ConfirmProps) => {
    if (!open) return null;

    return createPortal(
        <div
            className="modal-overlay"
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1100, // выше, чем у модалки (1000)
            }}
        >
            <div
                className="modal-content"
                style={{
                    background: 'var(--bg-card)',
                    borderRadius: '0.75rem',
                    maxWidth: '450px',
                    width: '90%',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid var(--border)',
                    }}
                >
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{title}</h2>
                    <button
                        onClick={onCancel}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: 'var(--text-dark)',
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                        &times;
                    </button>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <p style={{ marginBottom: '0.75rem' }}>{message}</p>
                    {warningText && (
                        <p style={{ color: 'var(--danger)', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                            ⚠️ {warningText}
                        </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button onClick={onCancel} className="btn-secondary">Отмена</button>
                        <button onClick={onConfirm} className="btn-danger">Удалить</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};