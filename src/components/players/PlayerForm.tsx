import { useEffect, useState } from 'react';
import { playerApi, teamApi } from '../../services/api';

interface Props {
    onSuccess: () => void;
    initialData?: PlayerResponseDto | null;
    onCancel: () => void;
}

export const PlayerForm = ({ onSuccess, initialData, onCancel }: Props) => {
    const [teams, setTeams] = useState<TeamResponseDto[]>([]);
    const [form, setForm] = useState<Omit<PlayerRequestDto, 'goals' | 'assists'>>({
        name: '',
        surname: '',
        number: 0,
        age: 16,
        teamId: 0,
        position: 'FORWARD'
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; surname?: string; number?: string; age?: string; teamId?: string }>({});

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
                position: initialData.positionName as any
            });
        } else {
            setForm({ name: '', surname: '', number: 0, age: 16, teamId: 0, position: 'FORWARD' });
        }
    }, [initialData, teams]);

    const validate = () => {
        const newErrors: any = {};
        if (!form.name.trim()) newErrors.name = 'Имя обязательно';
        if (!form.surname.trim()) newErrors.surname = 'Фамилия обязательна';
        if (form.number <= 0 || form.number > 99) newErrors.number = 'Номер от 1 до 99';
        if (form.age < 16 || form.age > 50) newErrors.age = 'Возраст от 16 до 50';
        if (form.teamId === 0) newErrors.teamId = 'Выберите команду';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const fullDto: PlayerRequestDto = {
                ...form,
                goals: 0,
                assists: 0
            };
            if (initialData) {
                await playerApi.update(initialData.id, fullDto);
            } else {
                await playerApi.create(fullDto);
            }
            onSuccess();
            if (!initialData) setForm({ name: '', surname: '', number: 0, age: 16, teamId: 0, position: 'FORWARD' });
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
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ width: '100%' }} />
                    {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.name}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Фамилия *</label>
                    <input type="text" value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} required style={{ width: '100%' }} />
                    {errors.surname && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.surname}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Номер *</label>
                    <input type="number" min="1" max="99" value={form.number || ''} onChange={e => setForm({ ...form, number: Number(e.target.value) })} required style={{ width: '100%' }} />
                    {errors.number && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.number}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Возраст *</label>
                    <input type="number" min="16" max="50" value={form.age || ''} onChange={e => setForm({ ...form, age: Number(e.target.value) })} required style={{ width: '100%' }} />
                    {errors.age && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.age}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Команда *</label>
                    <select value={form.teamId} onChange={e => setForm({ ...form, teamId: Number(e.target.value) })} required style={{ width: '100%' }}>
                        <option value={0}>-- Выберите команду --</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    {errors.teamId && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.teamId}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Позиция *</label>
                    <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value as any })} style={{ width: '100%' }}>
                        <option value="GOALKEEPER">Вратарь</option>
                        <option value="DEFENDER">Защитник</option>
                        <option value="FORWARD">Нападающий</option>
                    </select>
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