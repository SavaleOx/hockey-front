import { useEffect, useState } from 'react';
import { playerApi, teamApi } from '../../services/api';
import type { PlayerRequestDto, PlayerResponseDto, TeamResponseDto } from '../../types/index';

interface Props {
    onSuccess: () => void;
    initialData?: PlayerResponseDto | null;
    onCancel: () => void;
}

// Функция для форматирования имени/фамилии (первая буква заглавная, остальные строчные)
const formatName = (value: string): string => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

export const PlayerForm = ({ onSuccess, initialData, onCancel }: Props) => {
    const [teams, setTeams] = useState<TeamResponseDto[]>([]);
    const [form, setForm] = useState<PlayerRequestDto>({
        name: '',
        surname: '',
        number: 0,
        age: 0,
        teamId: 0,
        position: 'FORWARD',
        goals: 0,
        assists: 0
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        surname?: string;
        number?: string;
        age?: string;
        teamId?: string;
        busyNumber?: string;
    }>({});

    const [checkingNumber, setCheckingNumber] = useState(false);
    const [playersInSelectedTeam, setPlayersInSelectedTeam] = useState<PlayerResponseDto[]>([]);

    useEffect(() => {
        teamApi.getAll().then(res => setTeams(res.data));
    }, []);

    useEffect(() => {
        if (initialData) {
            const nameParts = initialData.fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            const matchedTeam = teams.find(t => t.name === initialData.teamName);
            setForm({
                name: firstName,
                surname: lastName,
                number: initialData.number,
                age: initialData.age,
                teamId: matchedTeam?.id || 0,
                position: initialData.positionName as any,
                goals: initialData.goals,
                assists: initialData.assists
            });
        } else {
            setForm({
                name: '',
                surname: '',
                number: 0,
                age: 0,
                teamId: 0,
                position: 'FORWARD',
                goals: 0,
                assists: 0
            });
        }
    }, [initialData, teams]);

    // Загрузка игроков выбранной команды
    useEffect(() => {
        const fetchPlayersForTeam = async () => {
            if (!form.teamId || form.teamId === 0) {
                setPlayersInSelectedTeam([]);
                return;
            }
            setCheckingNumber(true);
            try {
                const res = await playerApi.getAll({ teamId: form.teamId });
                setPlayersInSelectedTeam(res.data);
            } catch (err) {
                console.error('Ошибка загрузки игроков команды:', err);
            } finally {
                setCheckingNumber(false);
            }
        };
        fetchPlayersForTeam();
    }, [form.teamId]);

    // Проверка занятости номера
    useEffect(() => {
        if (!form.teamId || form.teamId === 0 || !form.number || form.number < 1 || form.number > 99) {
            if (errors.busyNumber) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.busyNumber;
                    return newErrors;
                });
            }
            return;
        }

        const conflictingPlayer = playersInSelectedTeam.find(
            p => p.number === form.number && (initialData ? p.id !== initialData.id : true)
        );

        if (conflictingPlayer) {
            setErrors(prev => ({
                ...prev,
                busyNumber: `Номер ${form.number} уже занят игроком ${conflictingPlayer.fullName} в команде ${conflictingPlayer.teamName}`
            }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.busyNumber;
                return newErrors;
            });
        }
    }, [form.number, form.teamId, playersInSelectedTeam, initialData, checkingNumber]);

    const validateAndClean = () => {
        const newErrors: any = {};
        let hasError = false;

        // Валидация имени
        if (!form.name.trim()) {
            newErrors.name = 'Имя обязательно';
            hasError = true;
        } else if (form.name.trim().length < 2) {
            newErrors.name = 'Имя должно содержать минимум 2 символа';
            hasError = true;
        }

        // Валидация фамилии
        if (!form.surname.trim()) {
            newErrors.surname = 'Фамилия обязательна';
            hasError = true;
        } else if (form.surname.trim().length < 2) {
            newErrors.surname = 'Фамилия должна содержать минимум 2 символа';
            hasError = true;
        }

        if (form.number < 1 || form.number > 99) {
            newErrors.number = 'Номер должен быть от 1 до 99. Поле очищено.';
            setForm(prev => ({ ...prev, number: 0 }));
            hasError = true;
        }

        if (form.age < 16 || form.age > 50) {
            newErrors.age = 'Возраст должен быть от 16 до 50. Поле очищено.';
            setForm(prev => ({ ...prev, age: 0 }));
            hasError = true;
        }

        if (form.teamId === 0) {
            newErrors.teamId = 'Выберите команду';
            hasError = true;
        }

        if (errors.busyNumber) {
            newErrors.busyNumber = errors.busyNumber;
            hasError = true;
        }

        setErrors(newErrors);
        return !hasError;
    };

    const handleNameChange = (value: string) => {
        const formatted = formatName(value);
        setForm({ ...form, name: formatted });
        if (errors.name) {
            setErrors(prev => ({ ...prev, name: undefined }));
        }
    };

    const handleSurnameChange = (value: string) => {
        const formatted = formatName(value);
        setForm({ ...form, surname: formatted });
        if (errors.surname) {
            setErrors(prev => ({ ...prev, surname: undefined }));
        }
    };

    const handleNumberInput = (value: string) => {
        const cleaned = value.replace(/[^\d]/g, '');
        const num = cleaned === '' ? 0 : parseInt(cleaned, 10);
        setForm({ ...form, number: num });
        if (errors.number) {
            setErrors(prev => ({ ...prev, number: undefined }));
        }
    };

    const handleAgeInput = (value: string) => {
        const cleaned = value.replace(/[^\d]/g, '');
        const num = cleaned === '' ? 0 : parseInt(cleaned, 10);
        setForm({ ...form, age: num });
        if (errors.age) {
            setErrors(prev => ({ ...prev, age: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateAndClean()) return;
        setSubmitting(true);
        try {
            if (initialData) {
                await playerApi.update(initialData.id, form);
            } else {
                await playerApi.create(form);
            }
            onSuccess();
            if (!initialData) {
                setForm({
                    name: '',
                    surname: '',
                    number: 0,
                    age: 0,
                    teamId: 0,
                    position: 'FORWARD',
                    goals: 0,
                    assists: 0
                });
            }
            onCancel();
        } catch (err) {
            console.error(err);
            alert('Ошибка сохранения игрока');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Имя *</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => handleNameChange(e.target.value)}
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
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Фамилия *</label>
                    <input
                        type="text"
                        value={form.surname}
                        onChange={e => handleSurnameChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: `1px solid ${errors.surname ? 'var(--danger)' : 'var(--border)'}`,
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
                    {errors.surname && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.surname}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Номер (1-99) *</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={form.number === 0 ? '' : form.number}
                        onChange={e => handleNumberInput(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: `1px solid ${errors.number || errors.busyNumber ? 'var(--danger)' : 'var(--border)'}`,
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
                    {errors.number && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.number}</span>}
                    {errors.busyNumber && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.busyNumber}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Возраст (16-50) *</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={form.age === 0 ? '' : form.age}
                        onChange={e => handleAgeInput(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: `1px solid ${errors.age ? 'var(--danger)' : 'var(--border)'}`,
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
                    {errors.age && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.age}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Команда *</label>
                    <select
                        value={form.teamId}
                        onChange={e => {
                            setForm({ ...form, teamId: Number(e.target.value) });
                            setErrors(prev => ({ ...prev, teamId: undefined, busyNumber: undefined }));
                        }}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: `1px solid ${errors.teamId ? 'var(--danger)' : 'var(--border)'}`,
                            borderRadius: '0.75rem',
                            background: 'var(--bg-card)',
                            color: 'var(--text-dark)',
                            fontSize: '1rem',
                            transition: 'border 0.2s, box-shadow 0.2s',
                            outline: 'none',
                        }}
                        onFocus={e => (e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.2)')}
                        onBlur={e => (e.target.style.boxShadow = 'none')}
                    >
                        <option value={0}>-- Выберите команду --</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.city})</option>)}
                    </select>
                    {errors.teamId && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.teamId}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Позиция *</label>
                    <select
                        value={form.position}
                        onChange={e => setForm({ ...form, position: e.target.value as any })}
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
                        }}
                        onFocus={e => (e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.2)')}
                        onBlur={e => (e.target.style.boxShadow = 'none')}
                    >
                        <option value="GOALKEEPER">Вратарь</option>
                        <option value="DEFENDER">Защитник</option>
                        <option value="FORWARD">Нападающий</option>
                    </select>
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
        </form>
    );
};