import { useEffect, useState } from 'react';
import { teamApi } from '../../services/api';
import type { TeamRequestDto, TeamResponseDto } from '../../types/index';

interface Props {
    onSuccess: () => void;
    initialData?: TeamResponseDto | null;
    onCancel: () => void;
}

export const TeamForm = ({ onSuccess, initialData, onCancel }: Props) => {
    const [form, setForm] = useState<TeamRequestDto>({ name: '', city: '' });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({ name: '', city: '', duplicate: '' });
    const [allTeams, setAllTeams] = useState<TeamResponseDto[]>([]);

    useEffect(() => {
        // Загружаем все команды для проверки уникальности
        teamApi.getAll().then(res => setAllTeams(res.data));
    }, []);

    useEffect(() => {
        if (initialData) {
            setForm({ name: initialData.name, city: initialData.city });
        } else {
            setForm({ name: '', city: '' });
        }
        setErrors({ name: '', city: '', duplicate: '' });
    }, [initialData]);

    const validate = () => {
        let valid = true;
        const newErrors = { name: '', city: '', duplicate: '' };

        if (!form.name.trim()) {
            newErrors.name = 'Название обязательно';
            valid = false;
        } else if (form.name.length > 20) {
            newErrors.name = 'Название не более 20 символов';
            valid = false;
        }

        if (!form.city.trim()) {
            newErrors.city = 'Город обязателен';
            valid = false;
        }

        // Проверка: нет ли уже команды с таким же названием в этом городе
        if (form.name.trim() && form.city.trim()) {
            const duplicate = allTeams.find(team =>
                team.name.toLowerCase() === form.name.trim().toLowerCase() &&
                team.city.toLowerCase() === form.city.trim().toLowerCase() &&
                (initialData ? team.id !== initialData.id : true)
            );
            if (duplicate) {
                newErrors.duplicate = `Команда "${form.name}" из города "${form.city}" уже существует`;
                valid = false;
            }
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            if (initialData) {
                await teamApi.update(initialData.id, form);
            } else {
                await teamApi.create(form);
            }
            onSuccess();
            if (!initialData) setForm({ name: '', city: '' });
            onCancel();
        } catch (err: any) {
            console.error(err);
            const message = err.response?.data?.message || 'Ошибка сохранения команды';
            if (message.toLowerCase().includes('уже существует')) {
                setErrors(prev => ({ ...prev, duplicate: message }));
            } else {
                alert(message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {errors.duplicate && (
                    <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(231,76,60,0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                        ⚠️ {errors.duplicate}
                    </div>
                )}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                        🏷️ Название команды <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => {
                                setForm({ ...form, name: e.target.value });
                                setErrors(prev => ({ ...prev, name: '', duplicate: '' }));
                            }}
                            placeholder="Например: Динамо"
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
                        {errors.name && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                        Город <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={form.city}
                            onChange={e => {
                                setForm({ ...form, city: e.target.value });
                                setErrors(prev => ({ ...prev, city: '', duplicate: '' }));
                            }}
                            placeholder="Например: Минск"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: `1px solid ${errors.city ? 'var(--danger)' : 'var(--border)'}`,
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
                        {errors.city && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>{errors.city}</span>}
                    </div>
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
            </div>
        </form>
    );
};