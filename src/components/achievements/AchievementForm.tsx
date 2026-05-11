import { useState, useEffect } from 'react';
import { achievementApi } from '../../services/api';
import type { AchievementRequestDto, AchievementResponseDto } from '../../types/index';

interface Props {
    onSuccess: () => void;
    initialData?: AchievementResponseDto | null;
    onCancel: () => void;
}

export const AchievementForm = ({ onSuccess, initialData, onCancel }: Props) => {
    const [form, setForm] = useState<AchievementRequestDto>({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ name?: string }>({});

    useEffect(() => {
        if (initialData) {
            setForm({ name: initialData.name, description: initialData.description || '' });
        } else {
            setForm({ name: '', description: '' });
        }
        setErrors({});
    }, [initialData]);

    const validate = () => {
        if (!form.name.trim()) {
            setErrors({ name: 'Название обязательно' });
            return false;
        }
        if (form.name.length > 50) {
            setErrors({ name: 'Название не может быть длиннее 50 символов' });
            return false;
        }
        setErrors({});
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            if (initialData) {
                await achievementApi.update(initialData.id, form);
            } else {
                await achievementApi.create(form);
            }
            onSuccess();
            if (!initialData) setForm({ name: '', description: '' });
            onCancel();
        } catch (err) {
            console.error(err);
            alert('Ошибка сохранения достижения');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                    Название <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: `1px solid ${errors.name ? 'var(--danger)' : 'var(--border)'}`,
                        borderRadius: '0.75rem',
                        background: 'var(--bg-card)',
                        color: 'var(--text-dark)',
                        fontSize: '1rem',
                        transition: 'border 0.2s, box-shadow 0.2s',
                        outline: 'none',
                    }}
                    onFocus={e => (e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.2)')}
                    onBlur={e => (e.target.style.boxShadow = 'none')}
                />
                {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.name}</span>}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                    📝 Описание
                </label>
                <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid var(--border)',
                        borderRadius: '0.75rem',
                        background: 'var(--bg-card)',
                        color: 'var(--text-dark)',
                        fontSize: '1rem',
                        transition: 'border 0.2s, box-shadow 0.2s',
                        outline: 'none',
                        resize: 'vertical'
                    }}
                    onFocus={e => (e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.2)')}
                    onBlur={e => (e.target.style.boxShadow = 'none')}
                    placeholder="Необязательное описание достижения"
                />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                {initialData && (
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '2rem',
                            border: 'none',
                            background: 'var(--border)',
                            color: 'var(--text-dark)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.1s, background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-light)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--border)')}
                    >
                        Отмена
                    </button>
                )}
                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        padding: '0.6rem 1.8rem',
                        borderRadius: '2rem',
                        border: 'none',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        transition: 'transform 0.1s, opacity 0.2s',
                        opacity: submitting ? 0.7 : 1,
                    }}
                    onMouseEnter={e => !submitting && (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {submitting ? 'Сохранение...' : initialData ? 'Обновить' : 'Создать'}
                </button>
            </div>
        </form>
    );
};