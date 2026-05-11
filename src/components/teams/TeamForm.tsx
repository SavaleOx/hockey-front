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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {errors.duplicate && (
                    <div style={{
                        color: '#d32f2f',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        background: '#ffebee',
                        padding: '0.5rem',
                        borderRadius: '0.5rem'
                    }}>
                        ⚠️ {errors.duplicate}
                    </div>
                )}

                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        color: '#1e293b'
                    }}>
                        Название команды <span style={{ color: '#d32f2f' }}>*</span>
                    </label>
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
                            padding: '0.7rem 0',
                            border: 'none',
                            borderBottom: `1px solid ${errors.name ? '#d32f2f' : '#e2e8f0'}`,
                            background: 'transparent',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={e => (e.currentTarget.style.borderBottomColor = '#3b82f6')}
                        onBlur={e => {
                            if (!errors.name) e.currentTarget.style.borderBottomColor = '#e2e8f0';
                        }}
                    />
                    {errors.name && <span style={{ fontSize: '0.75rem', color: '#d32f2f', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
                </div>

                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        color: '#1e293b'
                    }}>
                        Город <span style={{ color: '#d32f2f' }}>*</span>
                    </label>
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
                            padding: '0.7rem 0',
                            border: 'none',
                            borderBottom: `1px solid ${errors.city ? '#d32f2f' : '#e2e8f0'}`,
                            background: 'transparent',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={e => (e.currentTarget.style.borderBottomColor = '#3b82f6')}
                        onBlur={e => {
                            if (!errors.city) e.currentTarget.style.borderBottomColor = '#e2e8f0';
                        }}
                    />
                    {errors.city && <span style={{ fontSize: '0.75rem', color: '#d32f2f', marginTop: '0.25rem', display: 'block' }}>{errors.city}</span>}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    {initialData && (
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                padding: '0.5rem 1.2rem',
                                borderRadius: '2rem',
                                border: '1px solid #e2e8f0',
                                background: 'transparent',
                                color: '#475569',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            Отмена
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: '0.5rem 1.8rem',
                            borderRadius: '2rem',
                            border: 'none',
                            background: '#3b82f6',
                            color: 'white',
                            fontWeight: 500,
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            transition: 'background 0.2s, transform 0.1s'
                        }}
                        onMouseEnter={e => !submitting && (e.currentTarget.style.background = '#2563eb')}
                        onMouseLeave={e => !submitting && (e.currentTarget.style.background = '#3b82f6')}
                    >
                        {submitting ? 'Сохранение...' : initialData ? 'Обновить' : 'Создать'}
                    </button>
                </div>
            </div>
        </form>
    );
};