import { useEffect, useState } from 'react';
import { playerApi } from '../../services/api';
import { Modal } from '../common/Modal';

interface Props {
  teamId: number;
  teamName: string;
  onClose: () => void;
  onSelectPlayer: (playerId: number) => void;
}

export const TeamPlayersModal = ({ teamId, teamName, onClose, onSelectPlayer }: Props) => {
  const [players, setPlayers] = useState<PlayerResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    fetchPlayers();
  }, [teamId]);

  return (
    <Modal isOpen={true} onClose={onClose} title={`👥 Игроки команды «${teamName}»`}>
      {loading && <div className="loading-spinner" style={{ margin: '2rem auto' }} />}
      {!loading && players.length === 0 && <div style={{ padding: '2rem', textAlign: 'center' }}>Нет игроков</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
        {players.map(player => (
          <div
            key={player.id}
            onClick={() => onSelectPlayer(player.id)}
            className="list-item"
            style={{
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background 0.2s',
            }}
          >
            <span>
              <strong>{player.fullName}</strong> (#{player.number}) – {player.positionName}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--accent)' }}>
              ⚽ {player.goals} 🎯 {player.assists}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
};