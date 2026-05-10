import { useEffect, useState } from 'react';
import { statisticApi } from '../../services/api';
import type { StatisticRequestDto, StatisticResponseDto } from '../../types/index';

interface Props {
    playerId?: number;
    playerAge?: number;
    existingSeasons?: number[];       // сезоны, которые уже есть у игрока
    editId?: number;                  // id редактируемой записи (чтобы не блокировать её собственный сезон)
    onSuccess: () => void;
    initialData?: StatisticResponseDto | null;
    onCancel: () => void;
}

export const StatisticForm = ({ playerId, playerAge, existingSeasons = [], editId, onSuccess, initialData, onCancel }: Props) => {
    const currentYear = new Date().getFullYear();
    const [form, setForm] = useState<StatisticRequestDto>({
        playerId: playerId || 0,
        season: currentYear,
        goals: 0,
        assists: 0,
        games: 0
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ season?: string; games?: string; goals?: string; assists?: string }>({});
    const [duplicateError, setDuplicateError] = useState<string>('');

    // Минимальный сезон на основе возраста (минимальный возраст – 16 лет)
    const getMinSeason = () => {
        if (!playerAge) return currentYear - 2;
        const minAllowedAge = 16;
        if (playerAge < minAllowedAge) return currentYear;
        return currentYear - (playerAge - minAllowedAge);
    };

    const minSeason = getMinSeason();

    useEffect(() => {
        if (initialData) {
            setForm({
                playerId: initialData.playerId,
                season: initialData.season,
                goals: initialData.goals,
                assists: initialData.assists,
                games: initialData.games
            });
        } else {
            setForm({
                playerId: playerId || 0,
                season: currentYear,
                goals: 0,
                assists: 0,
                games: 0
            });
        }
        setErrors({});
        setDuplicateError('');
    }, [initialData, playerId, currentYear]);

    // Проверка на дубликат сезона
    const checkDuplicateSeason = (season: number): boolean => {
        if (!existingSeasons.length) return false;
        if (editId && initialData && initialData.season === season) {
            return false;
        }
        return existingSeasons.includes(season);
    };

    // Валидация конкретного поля
    const validateField = (field: string, value: number): string | undefined => {
        if (field === 'goals' && value > 150) {
            return 'Голов не может быть больше 150 за сезон';
        }
        if (field === 'assists' && value > 150) {
            return 'Передач не может быть больше 150 за сезон';
        }
        if (field === 'games' && value < 0) {
            return 'Игры не могут быть отрицательными';
        }
        return undefined;
    };

    const handleNumberChange = (field: 'goals' | 'assists' | 'games', value: string) => {
        const num = value === '' ? 0 : Number(value);

        // Проверяем, не превышает ли значение 150 (для голов и передач)
        const error = validateField(field, num);
        if (error) {
            setErrors(prev => ({ ...prev, [field]: error }));
            return;
        }

        setForm({ ...form, [field]: num });
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSeasonChange = (value: string) => {
        let num = value ? Number(value) : NaN;
        if (isNaN(num)) {
            setForm({ ...form, season: 0 });
            setDuplicateError('');
            return;
        }
        if (num < minSeason) num = minSeason;
        if (num > currentYear) num = currentYear;
        setForm({ ...form, season: num });

        if (checkDuplicateSeason(num)) {
            setDuplicateError(`Статистика за сезон ${num} уже существует. Используйте редактирование.`);
        } else {
            setDuplicateError('');
        }
    };

    const validate = () => {
        const newErrors: any = {};

        if (!form.season) newErrors.season = 'Введите сезон';
        else if (form.season < minSeason) newErrors.season = `Сезон не может быть меньше ${minSeason} (игроку должно быть не менее 16 лет)`;
        else if (form.season > currentYear) newErrors.season = `Сезон не может быть позже ${currentYear}`;
        else if (checkDuplicateSeason(form.season)) {
            newErrors.season = `Статистика за сезон ${form.season} уже существует`;
        }

        if (form.games < 0) newErrors.games = 'Игры не могут быть отрицательными';
        if (form.goals < 0) newErrors.goals = 'Голы не могут быть отрицательными';
        if (form.assists < 0) newErrors.assists = 'Передачи не могут быть отрицательными';

        if (form.goals > 150) newErrors.goals = 'Голов не может быть больше 150 за сезон';
        if (form.assists > 150) newErrors.assists = 'Передач не может быть больше 150 за сезон';

        setErrors(newErrors);
        setDuplicateError(newErrors.season || '');
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (!form.playerId) {
            alert('Игрок не выбран');
            return;
        }
        setSubmitting(true);
        try {
            if (initialData) {
                await statisticApi.update(initialData.id, form);
            } else {
                await statisticApi.create(form);
            }
            onSuccess();
            if (!initialData) {
                setForm({
                    playerId: playerId || 0,
                    season: currentYear,
                    goals: 0,
                    assists: 0,
                    games: 0
                });
            }
        } catch (err: any) {
            console.error(err);
            const message = err.response?.data || 'Ошибка сохранения статистики';
            if (message.includes('already exists') || message.includes('уже существует')) {
                setDuplicateError('Такая запись уже существует на сервере.');
            } else {
                alert(message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Сезон *</label>
                    <input
                        type="number"
                        value={form.season}
                        onChange={e => handleSeasonChange(e.target.value)}
                        required
                        min={minSeason}
                        max={currentYear}
                        step="1"
                        style={{ width: '100%' }}
                    />
                    {errors.season && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.season}</span>}
                    {duplicateError && !errors.season && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{duplicateError}</span>}
                    <span style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block' }}>
                        Допустимо с {minSeason} по {currentYear}
                    </span>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Игры *</label>
                    <input
                        type="number"
                        min="0"
                        value={form.games}
                        onChange={e => handleNumberChange('games', e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                    {errors.games && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.games}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Голы (макс. 150) *</label>
                    <input
                        type="number"
                        min="0"
                        max="150"
                        value={form.goals}
                        onChange={e => handleNumberChange('goals', e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                    {errors.goals && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.goals}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Передачи (макс. 150) *</label>
                    <input
                        type="number"
                        min="0"
                        max="150"
                        value={form.assists}
                        onChange={e => handleNumberChange('assists', e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                    {errors.assists && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.assists}</span>}
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