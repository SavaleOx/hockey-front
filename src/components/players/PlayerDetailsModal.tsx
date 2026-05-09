import { useEffect, useState } from 'react';
import { playerApi, statisticApi } from '../../services/api';
import { Modal } from '../common/Modal';
import type { PlayerResponseDto, StatisticResponseDto, AchievementResponseDto } from '../../types/index';

interface Props {
    playerId: number;
    onClose: () => void;
}

export const PlayerDetailsModal = ({ playerId, onClose }: Props) => {
    const [player, setPlayer] = useState<PlayerResponseDto | null>(null);
    const [stats, setStats] = useState<StatisticResponseDto[]>([]);
    const [achievements, setAchievements] = useState<AchievementResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [playerRes, statsRes, achRes] = await Promise.all([
                    playerApi.getById(playerId),
                    statisticApi.getByPlayer(playerId),
                    playerApi.getPlayerAchievements(playerId),
                ]);
                setPlayer(playerRes.data);
                setStats(statsRes.data);
                setAchievements(achRes.data);
            } catch (err) {
                console.error(err);
                alert('Ошибка загрузки данных игрока');
            } finally {
                setLoading(false);
            }
        };
        if (playerId) fetchData();
    }, [playerId]);

    if (!player) return null;

    return (
        <Modal isOpen={true} onClose={onClose} title={`🏒 Игрок: ${player.fullName}`}>
            {loading && <div className="loading-spinner" style={{ margin: '2rem auto' }} />}
            {!loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Основная информация */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.75rem',
                            background: 'var(--bg-card)',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                        }}
                    >
                        <div><strong>Номер:</strong> #{player.number}</div>
                        <div><strong>Возраст:</strong> {player.age} лет</div>
                        <div><strong>Позиция:</strong> {player.positionName}</div>
                        <div><strong>Команда:</strong> {player.teamName}</div>
                        <div><strong>Голы:</strong> {player.goals}</div>
                        <div><strong>Передачи:</strong> {player.assists}</div>
                        <div><strong>Очки:</strong> {player.points}</div>
                    </div>

                    {/* Статистика по сезонам */}
                    {stats.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>📊 Статистика по сезонам</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {stats.map(s => (
                                    <div
                                        key={s.id}
                                        style={{
                                            background: 'var(--bg-card)',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        <strong>{s.season}</strong>: {s.games} игр, ⚽ {s.goals} голов, 🎯 {s.assists} передач, 🏆 {s.points} очков
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Достижения – теперь бейджи с тултипом */}
                    {achievements.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>🏆 Достижения</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {achievements.map(ach => (
                                    <div key={ach.id} className="achievement-badge">
                                        {ach.name}
                                        {ach.description && <span className="tooltip">{ach.description}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};