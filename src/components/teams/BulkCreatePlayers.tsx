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

type RowErrors = {
    [key: number]: {
        name?: string;
        surname?: string;
        number?: string;
        age?: string;
        position?: string;
    };
};

export const BulkCreatePlayers = ({ teamId, teamName, onClose, onSuccess }: Props) => {
    const [players, setPlayers] = useState<TempPlayer[]>([
        { id: Date.now(), name: '', surname: '', number: 0, age: 0, position: 'FORWARD' }
    ]);
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState('');
    const [rowErrors, setRowErrors] = useState<RowErrors>({});

    const addPlayer = () => {
        setPlayers([
            ...players,
            { id: Date.now() + Math.random(), name: '', surname: '', number: 0, age: 0, position: 'FORWARD' }
        ]);
    };

    const removePlayer = (id: number) => {
        if (players.length > 1) {
            setPlayers(players.filter(p => p.id !== id));
            const newRowErrors = { ...rowErrors };
            delete newRowErrors[id];
            setRowErrors(newRowErrors);
        } else {
            setGlobalError('Должен быть хотя бы один игрок');
        }
    };

    const updatePlayer = (id: number, field: 'name' | 'surname' | 'position', value: string) => {
        setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));
        if (rowErrors[id]?.[field]) {
            const newRowErrors = { ...rowErrors };
            delete newRowErrors[id][field];
            if (Object.keys(newRowErrors[id]).length === 0) {
                delete newRowErrors[id];
            }
            setRowErrors(newRowErrors);
        }
    };

    const updateNumericField = (id: number, field: 'number' | 'age', value: string) => {
        const cleaned = value.replace(/[^\d]/g, '');
        const num = cleaned === '' ? 0 : parseInt(cleaned, 10);
        setPlayers(players.map(p => p.id === id ? { ...p, [field]: num } : p));
        if (rowErrors[id]?.[field]) {
            const newRowErrors = { ...rowErrors };
            delete newRowErrors[id][field];
            if (Object.keys(newRowErrors[id]).length === 0) {
                delete newRowErrors[id];
            }
            setRowErrors(newRowErrors);
        }
    };

    const validateAndClean = () => {
        let isValid = true;
        const newRowErrors: RowErrors = {};

        for (let i = 0; i < players.length; i++) {
            const p = players[i];
            const errorsForRow: RowErrors[number] = {};

            if (!p.name.trim()) {
                errorsForRow.name = 'Имя обязательно';
                isValid = false;
            }
            if (!p.surname.trim()) {
                errorsForRow.surname = 'Фамилия обязательна';
                isValid = false;
            }

            if (p.number < 1 || p.number > 99) {
                errorsForRow.number = 'Номер должен быть от 1 до 99. Поле очищено.';
                p.number = 0;
                isValid = false;
            }

            if (p.age < 16 || p.age > 50) {
                errorsForRow.age = 'Возраст должен быть от 16 до 50. Поле очищено.';
                p.age = 0;
                isValid = false;
            }

            if (Object.keys(errorsForRow).length > 0) {
                newRowErrors[p.id] = errorsForRow;
            }
        }

        setRowErrors(newRowErrors);
        setPlayers([...players]);

        if (!isValid) {
            setGlobalError('Пожалуйста, исправьте ошибки в форме');
        } else {
            setGlobalError('');
        }

        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateAndClean()) return;
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
            setGlobalError(err.response?.data?.message || err.message || 'Ошибка сохранения игроков');
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
                            👥 Массовое добавление игроков
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

                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <button onClick={addPlayer} className="btn-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ➕ Добавить игрока
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Имя</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Фамилия</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Номер (1-99)</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Возраст (16-50)</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Позиция</th>
                                    <th style={{ padding: '0.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.map(p => {
                                    const errors = rowErrors[p.id] || {};
                                    return (
                                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.5rem', verticalAlign: 'top' }}>
                                                <input
                                                    type="text"
                                                    value={p.name}
                                                    onChange={e => updatePlayer(p.id, 'name', e.target.value)}
                                                    placeholder="Имя"
                                                    style={{
                                                        width: '100%',
                                                        minWidth: '80px',
                                                        borderColor: errors.name ? 'var(--danger)' : undefined
                                                    }}
                                                />
                                                {errors.name && <div style={{ color: 'var(--danger)', fontSize: '0.7rem' }}>{errors.name}</div>}
                                            </td>
                                            <td style={{ padding: '0.5rem', verticalAlign: 'top' }}>
                                                <input
                                                    type="text"
                                                    value={p.surname}
                                                    onChange={e => updatePlayer(p.id, 'surname', e.target.value)}
                                                    placeholder="Фамилия"
                                                    style={{
                                                        width: '100%',
                                                        minWidth: '100px',
                                                        borderColor: errors.surname ? 'var(--danger)' : undefined
                                                    }}
                                                />
                                                {errors.surname && <div style={{ color: 'var(--danger)', fontSize: '0.7rem' }}>{errors.surname}</div>}
                                            </td>
                                            <td style={{ padding: '0.5rem', verticalAlign: 'top' }}>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={p.number === 0 ? '' : p.number}
                                                    onChange={e => updateNumericField(p.id, 'number', e.target.value)}
                                                    placeholder="№"
                                                    style={{
                                                        width: '80px',
                                                        borderColor: errors.number ? 'var(--danger)' : undefined
                                                    }}
                                                />
                                                {errors.number && <div style={{ color: 'var(--danger)', fontSize: '0.7rem' }}>{errors.number}</div>}
                                             </td>
                                            <td style={{ padding: '0.5rem', verticalAlign: 'top' }}>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={p.age === 0 ? '' : p.age}
                                                    onChange={e => updateNumericField(p.id, 'age', e.target.value)}
                                                    placeholder="Возраст"
                                                    style={{
                                                        width: '100px',
                                                        borderColor: errors.age ? 'var(--danger)' : undefined
                                                    }}
                                                />
                                                {errors.age && <div style={{ color: 'var(--danger)', fontSize: '0.7rem' }}>{errors.age}</div>}
                                             </td>
                                            <td style={{ padding: '0.5rem' }}>
                                                <select
                                                    value={p.position}
                                                    onChange={e => updatePlayer(p.id, 'position', e.target.value)}
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
                                             <tr>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {globalError && <div style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.85rem' }}>{globalError}</div>}
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