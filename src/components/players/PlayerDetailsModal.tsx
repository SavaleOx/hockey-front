import { useEffect, useState, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { playerApi, statisticApi } from '../../services/api';
import { Modal } from '../common/Modal';
import type { PlayerResponseDto, StatisticResponseDto, AchievementResponseDto } from '../../types/index';

const getRussianPosition = (positionName: string): string => {
    switch (positionName) {
        case 'GOALKEEPER': return 'Вратарь';
        case 'DEFENDER': return 'Защитник';
        case 'FORWARD': return 'Нападающий';
        default: return positionName;
    }
};

const TooltipPortal = ({ children, targetRef }: { children: ReactNode; targetRef: React.RefObject<HTMLDivElement> }) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [visible, setVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const element = targetRef.current;
        if (!element) return;

        const showTooltip = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsHovering(true);
            const rect = element.getBoundingClientRect();
            setPosition({
                top: rect.top - 8,
                left: rect.left + rect.width / 2,
            });
            setVisible(true);
        };

        const hideTooltip = () => {
            timeoutRef.current = window.setTimeout(() => {
                setIsHovering(false);
                setVisible(false);
            }, 100);
        };

        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);

        return () => {
            element.removeEventListener('mouseenter', showTooltip);
            element.removeEventListener('mouseleave', hideTooltip);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [targetRef]);

    if (!visible && !isHovering) return null;

    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                transform: 'translateX(-50%) translateY(-100%)',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                color: '#fff',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                maxWidth: '280px',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                zIndex: 10000,
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'opacity 0.15s ease',
                opacity: visible ? 1 : 0,
            }}
        >
            {children}
            <div
                style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid rgba(0, 0, 0, 0.9)',
                }}
            />
        </div>,
        document.body
    );
};

const AchievementBadge = ({ name, description }: { name: string; description?: string }) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <>
            <div
                ref={ref}
                className="achievement-badge"
                style={{ cursor: 'help' }}
            >
                {name}
            </div>
            {description && <TooltipPortal targetRef={ref}>{description}</TooltipPortal>}
        </>
    );
};

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
                const sortedStats = [...statsRes.data].sort((a, b) => b.season - a.season);
                setStats(sortedStats);
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
                        <div><strong>Позиция:</strong> {getRussianPosition(player.positionName)}</div>
                        <div><strong>Команда:</strong> {player.teamName}</div>
                        <div><strong>Голы:</strong> 🏒 {player.goals}</div>
                        <div><strong>Передачи:</strong> 🎯 {player.assists}</div>
                        <div><strong>Очки:</strong> ⭐ {player.points}</div>
                    </div>

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
                                        <strong>{s.season}</strong>: {s.games} игр, 🏒 {s.goals} голов, 🎯 {s.assists} передач, ⭐ {s.points} очков
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {achievements.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>🏆 Достижения</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {achievements.map(ach => (
                                    <AchievementBadge key={ach.id} name={ach.name} description={ach.description} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};