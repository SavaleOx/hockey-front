import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
            setIsAnimating(true);
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen && !isAnimating) return null;

    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                opacity: isOpen ? 1 : 0,
                transition: 'opacity 0.2s ease',
            }}
            onClick={onClose}
            onTransitionEnd={() => !isOpen && setIsAnimating(false)}
        >
            <div
                style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '1.5rem',
                    boxShadow: '0 25px 40px -12px rgba(0, 0, 0, 0.35)',
                    maxWidth: '520px',
                    width: '90%',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transform: isOpen ? 'scale(1)' : 'scale(0.95)',
                    transition: 'transform 0.2s ease',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Заголовок с иконкой */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.25rem 1.5rem',
                        borderBottom: '2px solid var(--border)',
                        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                        color: 'white',
                    }}
                >
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: 'white',
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.4)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                    >
                        &times;
                    </button>
                </div>
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>{children}</div>
            </div>
        </div>,
        document.body
    );
};