import { useEffect, useState, useMemo } from 'react';
import { coachApi, teamApi } from '../../services/api';
import type { CoachRequestDto, CoachResponseDto, TeamResponseDto } from '../../types/index';

interface Props {
    onSuccess: () => void;
    initialData?: CoachResponseDto | null;
    onCancel: () => void;
}

export const CoachForm = ({ onSuccess, initialData, onCancel }: Props) => {
    const [teams, setTeams] = useState<TeamResponseDto[]>([]);
    const [form, setForm] = useState<CoachRequestDto>({
        name: '',
        surname: '',
        age: 0,
        tactic: '',
        teamId: 0
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; surname?: string; age?: string; teamId?: string }>({});

    useEffect(() => {
        teamApi.getAll().then(res => setTeams(res.data));
    }, []);

    useEffect(() => {
        if (initialData) {
            const matchedTeam = teams.find(t => t.name === initialData.teamName);
            setForm({
                name: initialData.name,
                surname: initialData.surname,
                age: initialData.age,
                tactic: initialData.tactic || '',
                teamId: matchedTeam?.id || 0
            });
        } else {
            setForm({ name: '', surname: '', age: 0, tactic: '', teamId: 0 });
        }
    }, [initialData, teams]);

    const availableTeams = useMemo(() => {
        if (!teams.length) return [];
        if (!initialData) {
            return teams.filter(team => team.coachId === null || team.coachId === undefined);
        }
        const currentTeamId = teams.find(t => t.name === initialData.teamName)?.id;
        return teams.filter(team =>
            (team.coachId === null || team.coachId === undefined) || team.id === currentTeamId
        );
    }, [teams, initialData]);

    const handleAgeInput = (value: string) => {
        const cleaned = value.replace(/[^\d]/g, '');
        const num = cleaned === '' ? 0 : parseInt(cleaned, 10);
        setForm({ ...form, age: num });
        if (errors.age) {
            setErrors(prev => ({ ...prev, age: undefined }));
        }
    };

    const validateAndClean = () => {
        const newErrors: any = {};
        let hasError = false;

        if (!form.name.trim()) {
            newErrors.name = 'Имя обязательно';
            hasError = true;
        }
        if (!form.surname.trim()) {
            newErrors.surname = 'Фамилия обязательна';
            hasError = true;
        }

        if (form.age < 18 || form.age > 80) {
            newErrors.age = 'Возраст должен быть от 18 до 80. Поле очищено.';
            setForm(prev => ({ ...prev, age: 0 }));
            hasError = true;
        }

        if (form.teamId === 0) {
            newErrors.teamId = 'Выберите команду';
            hasError = true;
        }

        setErrors(newErrors);
        return !hasError;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateAndClean()) return;
        setSubmitting(true);
        try {
            if (initialData) {
                await coachApi.update(initialData.id, form);
            } else {
                await coachApi.create(form);
            }
            onSuccess();
            if (!initialData) setForm({ name: '', surname: '', age: 0, tactic: '', teamId: 0 });
            onCancel();
        } catch (err) {
            console.error(err);
            alert('Ошибка сохранения тренера');
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
                        onChange={e => {
                            setForm({ ...form, name: e.target.value });
                            setErrors(prev => ({ ...prev, name: undefined }));
                        }}
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
                        onChange={e => {
                            setForm({ ...form, surname: e.target.value });
                            setErrors(prev => ({ ...prev, surname: undefined }));
                        }}
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
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Возраст (18-80) *</label>
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
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Тактика</label>
                    <input
                        type="text"
                        value={form.tactic}
                        onChange={e => setForm({ ...form, tactic: e.target.value })}
                        placeholder="Например: атакующий"
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
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Команда *</label>
                    <select
                        value={form.teamId}
                        onChange={e => {
                            setForm({ ...form, teamId: Number(e.target.value) });
                            setErrors(prev => ({ ...prev, teamId: undefined }));
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
                        <option value={0}>Выберите команду</option>
                        {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.city}) {t.coachId ? '(текущая команда)' : ''}</option>)}
                    </select>
                    {errors.teamId && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.teamId}</span>}
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.25rem' }}>
                        * Показываются только команды без тренера (при редактировании также ваша текущая команда)
                    </div>
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