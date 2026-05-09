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
                    🏷️ Название <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: `1px solid ${errors.name ? 'var(--danger)' : 'var(--border)'}`,
                        borderRadius: '0.375rem',
                        background: 'var(--bg-card)',
                        color: 'var(--text-dark)'
                    }}
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
                        padding: '0.5rem',
                        border: '1px solid var(--border)',
                        borderRadius: '0.375rem',
                        background: 'var(--bg-card)',
                        color: 'var(--text-dark)',
                        resize: 'vertical'
                    }}
                    placeholder="Необязательное описание достижения"
                />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Сохранение...' : initialData ? 'Обновить' : 'Создать'}
                </button>
                {initialData && (
                    <button type="button" onClick={onCancel} className="btn-secondary">
                        Отмена
                    </button>
                )}
            </div>
        </form>
    );
};