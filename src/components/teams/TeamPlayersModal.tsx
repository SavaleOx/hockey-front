import { useEffect, useState } from 'react';
import { playerApi } from '../../services/api';
import { Modal } from '../common/Modal';
import { BulkCreatePlayers } from './BulkCreatePlayers';
import type { PlayerResponseDto } from '../../types/index';

const getRussianPosition = (positionName: string): string => {
    switch (positionName) {
        case 'GOALKEEPER': return 'Вратарь';
        case 'DEFENDER': return 'Защитник';
        case 'FORWARD': return 'Нападающий';
        default: return positionName;
    }
};

interface Props {
    teamId: number;
    teamName: string;
    onClose: () => void;
    onSelectPlayer: (playerId: number) => void;
}

export const TeamPlayersModal = ({ teamId, teamName, onClose, onSelectPlayer }: Props) => {
    const [players, setPlayers] = useState<PlayerResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const res = await playerApi.getAll({ teamId });
            setPlayers(res.data);
        } catch (err) {
            console.error(err);
            alert('Ошибка загрузки игроков');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, [teamId]);

    const handleBulkSuccess = () => {
        setShowBulkModal(false);
        fetchPlayers();
    };

    return (
        <>
            <Modal isOpen={true} onClose={onClose} title={`Игроки команды «${teamName}»`}>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => setShowBulkModal(true)}
                        style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '2rem',
                            border: 'none',
                            background: '#10b981',
                            color: 'white',
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#059669')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#10b981')}
                    >
                        + Массовое добавление
                    </button>
                </div>

                {loading && <div className="loading-spinner" style={{ margin: '2rem auto' }} />}
                {!loading && players.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        Нет игроков. Нажмите «Массовое добавление», чтобы создать.
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
                    {players.map(player => (
                        <div
                            key={player.id}
                            onClick={() => onSelectPlayer(player.id)}
                            style={{
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderRadius: '0.5rem',
                                borderBottom: '1px solid #f1f5f9',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <div>
                                <strong>{player.fullName}</strong> <span style={{ color: '#64748b' }}>#{player.number}</span>
                                <br />
                                <span style={{ fontSize: '0.8rem', color: '#3b82f6' }}>{getRussianPosition(player.positionName)}</span>
                            </div>
                            {/* Статистика полностью убрана */}
                        </div>
                    ))}
                </div>
            </Modal>

            {showBulkModal && (
                <BulkCreatePlayers
                    teamId={teamId}
                    teamName={teamName}
                    onClose={() => setShowBulkModal(false)}
                    onSuccess={handleBulkSuccess}
                />
            )}
        </>
    );
};