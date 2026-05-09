import { useEffect, useState } from 'react';
import { playerApi, achievementApi } from '../../services/api';
import { Modal } from '../common/Modal';
import type { AchievementResponseDto } from '../../types/index';

interface Props {
    playerId: number;
    onClose: () => void;
}

export const PlayerAchievements = ({ playerId, onClose }: Props) => {
    const [allAchievements, setAllAchievements] = useState<AchievementResponseDto[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [playerAchievementsRes, allAchievementsRes] = await Promise.all([
                playerApi.getPlayerAchievements(playerId),
                achievementApi.getAll()
            ]);
            setAllAchievements(allAchievementsRes.data);
            setSelectedIds(playerAchievementsRes.data.map(a => a.id));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [playerId]);

    const handleSave = async () => {
        await playerApi.setAchievements(playerId, selectedIds);
        onClose(); // закрываем окно после сохранения
    };

    const toggle = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredAchievements = allAchievements.filter(ach =>
        ach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ach.description && ach.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Modal isOpen={true} onClose={onClose} title="🏆 Управление достижениями">
            {loading && <div className="loading-spinner" style={{ margin: '2rem auto' }} />}
            {!loading && (
                <>
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="🔍 Поиск достижений..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                background: 'var(--bg-card)',
                                color: 'var(--text-dark)'
                            }}
                        />
                    </div>
                    <div style={{ maxHeight: '50vh', overflowY: 'auto', marginBottom: '1rem' }}>
                        {filteredAchievements.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dark)' }}>
                                Ничего не найдено
                            </div>
                        )}
                        {filteredAchievements.map(ach => (
                            <label
                                key={ach.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    transition: 'background 0.1s'
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(ach.id)}
                                    onChange={() => toggle(ach.id)}
                                    style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                                />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{ach.name}</div>
                                    {ach.description && <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{ach.description}</div>}
                                </div>
                            </label>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button onClick={onClose} className="btn-secondary">Отмена</button>
                        <button onClick={handleSave} className="btn-primary">Сохранить</button>
                    </div>
                </>
            )}
        </Modal>
    );
};