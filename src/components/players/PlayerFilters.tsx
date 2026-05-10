import { useState, useEffect } from 'react';

interface Props {
    teams: { id: number; name: string }[];
    onFilterChange: (filters: any) => void;
    onReset: () => void;
}

export const PlayerFilters = ({ teams, onFilterChange, onReset }: Props) => {
    const [showFilters, setShowFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [teamName, setTeamName] = useState('');
    const [position, setPosition] = useState('');
    const [minAge, setMinAge] = useState<number | undefined>();
    const [maxAge, setMaxAge] = useState<number | undefined>();
    const [minGoals, setMinGoals] = useState<number | undefined>();
    const [maxGoals, setMaxGoals] = useState<number | undefined>();
    const [minAssists, setMinAssists] = useState<number | undefined>();
    const [maxAssists, setMaxAssists] = useState<number | undefined>();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const applyFilters = () => {
        onFilterChange({
            teamName: teamName || undefined,
            position: position || undefined,
            minGoals,
            maxGoals,
            minAssists,
            maxAssists,
            minAge,
            maxAge,
        });
    };

    const handleReset = () => {
        setTeamName('');
        setPosition('');
        setMinAge(undefined);
        setMaxAge(undefined);
        setMinGoals(undefined);
        setMaxGoals(undefined);
        setMinAssists(undefined);
        setMaxAssists(undefined);
        onReset();
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                🔍 {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
            </button>
            {showFilters && (
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    border: '1px solid var(--border)'
                }}>
                    {/* Первая строка: 4 поля */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                        gap: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Команда</label>
                            <select value={teamName} onChange={e => setTeamName(e.target.value)} style={{ width: '100%', padding: '0.4rem' }}>
                                <option value="">Все команды</option>
                                {teams.map(team => <option key={team.id} value={team.name}>{team.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Позиция</label>
                            <select value={position} onChange={e => setPosition(e.target.value)} style={{ width: '100%', padding: '0.4rem' }}>
                                <option value="">Все позиции</option>
                                <option value="GOALKEEPER">Вратарь</option>
                                <option value="DEFENDER">Защитник</option>
                                <option value="FORWARD">Нападающий</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Возраст (от)</label>
                            <input type="number" placeholder="16" value={minAge || ''} onChange={e => setMinAge(e.target.value ? Number(e.target.value) : undefined)} style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Возраст (до)</label>
                            <input type="number" placeholder="50" value={maxAge || ''} onChange={e => setMaxAge(e.target.value ? Number(e.target.value) : undefined)} style={{ width: '100%' }} />
                        </div>
                    </div>
                    {/* Вторая строка: 4 поля */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Голы (от)</label>
                            <input type="number" placeholder="0" value={minGoals || ''} onChange={e => setMinGoals(e.target.value ? Number(e.target.value) : undefined)} style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Голы (до)</label>
                            <input type="number" placeholder="100" value={maxGoals || ''} onChange={e => setMaxGoals(e.target.value ? Number(e.target.value) : undefined)} style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Передачи (от)</label>
                            <input type="number" placeholder="0" value={minAssists || ''} onChange={e => setMinAssists(e.target.value ? Number(e.target.value) : undefined)} style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Передачи (до)</label>
                            <input type="number" placeholder="100" value={maxAssists || ''} onChange={e => setMaxAssists(e.target.value ? Number(e.target.value) : undefined)} style={{ width: '100%' }} />
                        </div>
                    </div>
                    {/* Кнопки */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button onClick={applyFilters} className="btn-primary">Применить</button>
                        <button onClick={handleReset} className="btn-secondary">Сбросить</button>
                    </div>
                </div>
            )}
        </div>
    );
};