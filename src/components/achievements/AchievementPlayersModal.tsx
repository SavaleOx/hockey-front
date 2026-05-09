import { useEffect, useState } from 'react';
import { playerApi, achievementApi } from '../../services/api';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface Props {
    achievementId: number;
    achievementName: string;
    onClose: () => void;
    onUpdate: () => void;
}

export const AchievementPlayersModal = ({ achievementId, achievementName, onClose, onUpdate }: Props) => {
    const [data, setData] = useState<AchievementPlayersDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null); // для индикации загрузки на кнопке

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await achievementApi.getPlayers(achievementId);
            setData(res.data);
        } catch (err) {
            console.error(err);
            alert('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [achievementId]);

    const handleAdd = async (playerId: number) => {
        setActionLoading(playerId);
        try {
            await playerApi.addAchievement(playerId, achievementId);
            await fetchData();
            onUpdate();
        } catch (err) {
            console.error(err);
            alert('Ошибка добавления достижения');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemove = async (playerId: number) => {
        setActionLoading(playerId);
        try {
            await playerApi.removeAchievement(playerId, achievementId);
            await fetchData();
            onUpdate();
        } catch (err) {
            console.error(err);
            alert('Ошибка удаления достижения');
        } finally {
            setActionLoading(null);
        }
    };

    if (!data) return null;

    // Фильтрация доступных игроков по имени и команде
    const filteredAvailable = data.playersWithoutAchievement.filter(p =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.teamName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Modal isOpen={true} onClose={onClose} title={`🏆 Игроки с достижением «${achievementName}»`}>
                {loading && <div className="loading-spinner" style={{ margin: '2rem auto' }} />}
                {!loading && (
                    <>
                        {/* Блок с уже имеющими достижение */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>👥 Есть достижение:</h3>
                            {data.playersWithAchievement.length === 0 && <p style={{ opacity: 0.7 }}>Нет игроков с этим достижением.</p>}
                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem' }}>
                                {data.playersWithAchievement.map(p => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <span>{p.fullName} (#{p.number}) – {p.teamName}</span>
                                        <button
                                            onClick={() => setConfirmDeleteId(p.id)}
                                            className="btn-danger"
                                            style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                                            disabled={actionLoading === p.id}
                                        >
                                            {actionLoading === p.id ? '...' : '🗑️'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Блок добавления – поиск + список */}
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>➕ Добавить игроку:</h3>
                            <input
                                type="text"
                                placeholder="🔍 Поиск по имени или команде..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.4rem',
                                    marginBottom: '0.75rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0.375rem',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-dark)'
                                }}
                            />
                            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem' }}>
                                {filteredAvailable.length === 0 && <p style={{ padding: '0.5rem', textAlign: 'center', opacity: 0.7 }}>Нет игроков для добавления</p>}
                                {filteredAvailable.map(p => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <span>{p.fullName} (#{p.number}) – {p.teamName}</span>
                                        <button
                                            onClick={() => handleAdd(p.id)}
                                            className="btn-primary"
                                            style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                                            disabled={actionLoading === p.id}
                                        >
                                            {actionLoading === p.id ? '...' : '➕ Добавить'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </Modal>

            <ConfirmDialog
                open={!!confirmDeleteId}
                title="Удаление достижения у игрока"
                message="Вы уверены, что хотите удалить это достижение у выбранного игрока?"
                warningText="Это действие необратимо, но вы сможете добавить достижение снова позже."
                onConfirm={() => {
                    if (confirmDeleteId) handleRemove(confirmDeleteId);
                    setConfirmDeleteId(null);
                }}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </>
    );
};