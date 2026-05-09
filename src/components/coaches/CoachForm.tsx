import { useEffect, useState, useMemo } from 'react';
import { coachApi, teamApi } from '../../services/api';

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
        age: 18,
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
            setForm({ name: '', surname: '', age: 18, tactic: '', teamId: 0 });
        }
    }, [initialData, teams]);

    // Определяем доступные команды для выбора
    const availableTeams = useMemo(() => {
        if (!teams.length) return [];
        // При создании: только команды без тренера
        if (!initialData) {
            return teams.filter(team => team.coachId === null || team.coachId === undefined);
        }
        // При редактировании: команды без тренера ИЛИ текущая команда тренера
        const currentTeamId = teams.find(t => t.name === initialData.teamName)?.id;
        return teams.filter(team =>
            (team.coachId === null || team.coachId === undefined) || team.id === currentTeamId
        );
    }, [teams, initialData]);

    const validate = () => {
        const newErrors: any = {};
        if (!form.name.trim()) newErrors.name = 'Имя обязательно';
        if (!form.surname.trim()) newErrors.surname = 'Фамилия обязательна';
        if (form.age < 18 || form.age > 80) newErrors.age = 'Возраст от 18 до 80';
        if (form.teamId === 0) newErrors.teamId = 'Выберите команду';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            if (initialData) {
                await coachApi.update(initialData.id, form);
            } else {
                await coachApi.create(form);
            }
            onSuccess();
            if (!initialData) setForm({ name: '', surname: '', age: 18, tactic: '', teamId: 0 });
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
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ width: '100%' }} />
                    {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.name}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Фамилия *</label>
                    <input type="text" value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} required style={{ width: '100%' }} />
                    {errors.surname && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.surname}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Возраст *</label>
                    <input type="number" min="18" max="80" value={form.age || ''} onChange={e => setForm({ ...form, age: Number(e.target.value) })} required style={{ width: '100%' }} />
                    {errors.age && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.age}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Тактика</label>
                    <input type="text" value={form.tactic} onChange={e => setForm({ ...form, tactic: e.target.value })} placeholder="Например: атакующий" style={{ width: '100%' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Команда *</label>
                    <select value={form.teamId} onChange={e => setForm({ ...form, teamId: Number(e.target.value) })} required style={{ width: '100%' }}>
                        <option value={0}>Выберите команду</option>
                        {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name} {t.coachId ? '(текущая команда)' : ''}</option>)}
                    </select>
                    {errors.teamId && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.teamId}</span>}
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.25rem' }}>
                        * Показываются только команды без тренера (при редактировании также ваша текущая команда)
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Сохранение...' : initialData ? 'Обновить' : 'Создать'}
                </button>
                {initialData && <button type="button" onClick={onCancel} className="btn-secondary">Отмена</button>}
            </div>
        </form>
    );
};