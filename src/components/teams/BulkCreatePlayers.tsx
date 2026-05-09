import { useState } from 'react';
import { teamApi } from '../../services/api';
import type { PlayerRequestDto } from '../../types/index';

interface Props {
    teamId: number;
    teamName?: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface TempPlayer {
    id: number;
    name: string;
    surname: string;
    number: number;
    age: number;
    position: 'GOALKEEPER' | 'DEFENDER' | 'FORWARD';
}

export const BulkCreatePlayers = ({ teamId, teamName, onClose, onSuccess }: Props) => {
    const [players, setPlayers] = useState<TempPlayer[]>([
        { id: Date.now(), name: '', surname: '', number: 0, age: 0, position: 'FORWARD' }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const addPlayer = () => {
        setPlayers([
            ...players,
            { id: Date.now() + Math.random(), name: '', surname: '', number: 0, age: 0, position: 'FORWARD' }
        ]);
    };

    const removePlayer = (id: number) => {
        if (players.length > 1) {
            setPlayers(players.filter(p => p.id !== id));
        } else {
            setError('Должен быть хотя бы один игрок');
        }
    };

    const updatePlayer = (id: number, field: keyof TempPlayer, value: string | number) => {
        setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const validate = () => {
        for (let i = 0; i < players.length; i++) {
            const p = players[i];
            if (!p.name.trim() || !p.surname.trim() || p.number <= 0 || p.age < 16 || p.age > 50) {
                setError(`Ошибка в строке ${i + 1}: заполните все поля (имя, фамилия, номер >0, возраст 16-50)`);
                return false;
            }
        }
        setError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const dtoList: PlayerRequestDto[] = players.map(p => ({
                name: p.name,
                surname: p.surname,
                number: p.number,
                age: p.age,
                teamId: teamId,
                position: p.position,
                goals: 0,
                assists: 0
            }));
            await teamApi.bulkCreatePlayers(teamId, dtoList);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Ошибка сохранения игроков');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" style={{
                background: 'var(--bg-card)',
                borderRadius: '1rem',
                maxWidth: '900px',
                width: '90%',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '2px solid var(--border)',
                    background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
                            📦 Массовое добавление игроков
                        </h2>
                        <p style={{ margin: '0.25rem 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
                            в команду <strong>{teamName || `ID ${teamId}`}</strong>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: 'white',
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.4)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <button onClick={addPlayer} className="btn-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ➕ Добавить игрока
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Имя</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Фамилия</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Номер</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Возраст</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Позиция</th>
                                    <th style={{ padding: '0.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={p.name}
                                                onChange={e => updatePlayer(p.id, 'name', e.target.value)}
                                                placeholder="Имя"
                                                style={{ width: '100%', minWidth: '80px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={p.surname}
                                                onChange={e => updatePlayer(p.id, 'surname', e.target.value)}
                                                placeholder="Фамилия"
                                                style={{ width: '100%', minWidth: '100px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                type="number"
                                                min="1"
                                                max="99"
                                                value={p.number || ''}
                                                onChange={e => updatePlayer(p.id, 'number', Number(e.target.value))}
                                                placeholder="№"
                                                style={{ width: '70px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                type="number"
                                                min="16"
                                                max="50"
                                                value={p.age || ''}
                                                onChange={e => updatePlayer(p.id, 'age', Number(e.target.value))}
                                                placeholder="Возраст"
                                                style={{ width: '80px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <select
                                                value={p.position}
                                                onChange={e => updatePlayer(p.id, 'position', e.target.value as any)}
                                                style={{ width: '130px' }}
                                            >
                                                <option value="GOALKEEPER">Вратарь</option>
                                                <option value="DEFENDER">Защитник</option>
                                                <option value="FORWARD">Нападающий</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => removePlayer(p.id)}
                                                className="btn-danger"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                                title="Удалить игрока"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {error && <div style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.85rem' }}>{error}</div>}
                </div>

                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    background: 'var(--bg-card)'
                }}>
                    <button onClick={onClose} className="btn-secondary" disabled={loading}>
                        Отмена
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                        {loading ? 'Загрузка...' : '📤 Добавить игроков'}
                    </button>
                </div>
            </div>
        </div>
    );
};