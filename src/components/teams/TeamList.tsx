import { useEffect, useState } from 'react';
import { teamApi } from '../../services/api';
import { TeamForm } from './TeamForm';
import { BulkCreatePlayers } from './BulkCreatePlayers';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';
import { TeamPlayersModal } from './TeamPlayersModal';
import { PlayerDetailsModal } from '../players/PlayerDetailsModal';
import type { TeamResponseDto } from '../../types/index';

export const TeamList = () => {
    const [teams, setTeams] = useState<TeamResponseDto[]>([]);
    const [editingTeam, setEditingTeam] = useState<TeamResponseDto | null>(null);
    const [bulkTeamId, setBulkTeamId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
    const [selectedTeamName, setSelectedTeamName] = useState('');
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        return (localStorage.getItem('teamViewMode') as 'grid' | 'list') || 'grid';
    });

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const res = await teamApi.getAll();
            setTeams(res.data);
        } catch (err) {
            console.error(err);
            alert('Ошибка загрузки команд');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        localStorage.setItem('teamViewMode', viewMode);
    }, [viewMode]);

    const handleDelete = async () => {
        if (deleteId) {
            setLoading(true);
            await teamApi.delete(deleteId);
            setDeleteId(null);
            await fetchTeams();
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingTeam(null);
        setIsModalOpen(true);
    };

    const openEditModal = (team: TeamResponseDto) => {
        setEditingTeam(team);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTeam(null);
    };

    const handleFormSuccess = async () => {
        await fetchTeams();
        closeModal();
    };

    const handleTeamClick = (teamId: number, teamName: string) => {
        setSelectedTeamId(teamId);
        setSelectedTeamName(teamName);
    };

    const handleSelectPlayer = (playerId: number) => {
        setSelectedTeamId(null);
        setSelectedPlayerId(playerId);
    };

    const filteredTeams = teams.filter(
        team =>
            team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '1rem', maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                gap: '1rem'
            }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Команды
                    <span style={{ fontSize: '0.875rem', background: 'var(--border)', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                        {filteredTeams.length}
                    </span>
                </h1>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Поиск по названию или городу..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.5rem 0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            background: 'var(--bg-card)',
                            color: 'var(--text-dark)',
                            minWidth: '280px',
                            fontSize: '1rem'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{ padding: '0.5rem 0.75rem', background: viewMode === 'grid' ? 'var(--accent)' : 'transparent', border: 'none', borderRadius: '0.5rem 0 0 0.5rem', cursor: 'pointer', color: viewMode === 'grid' ? 'white' : 'var(--text-dark)' }}
                        >
                            Сетка
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{ padding: '0.5rem 0.75rem', background: viewMode === 'list' ? 'var(--accent)' : 'transparent', border: 'none', borderRadius: '0 0.5rem 0.5rem 0', cursor: 'pointer', color: viewMode === 'list' ? 'white' : 'var(--text-dark)' }}
                        >
                            Список
                        </button>
                    </div>
                    <button onClick={openCreateModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Создать команду
                    </button>
                </div>
            </div>

            {loading && <div className="loading-spinner" style={{ margin: '2rem auto' }} />}
            {!loading && filteredTeams.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dark)' }}>
                    {searchTerm ? 'Ничего не найдено' : 'Пока нет команд. Создайте первую!'}
                </div>
            )}

            {viewMode === 'grid' && (
                <div className="grid-view">
                    {filteredTeams.map(team => (
                        <div key={team.id} className="list-item" style={{ padding: '1.25rem', borderRadius: '0.75rem', transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => handleTeamClick(team.id, team.name)}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {team.name}
                                    </h3>
                                    <p style={{ color: 'var(--text-dark)', opacity: 0.8, marginTop: '0.25rem' }}>{team.city}</p>
                                    <div style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
                                        <div>Тренер: {team.coachFullName || 'не назначен'}</div>
                                        <div>Игроков: {team.playerIds.length}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}>
                                    <button onClick={() => openEditModal(team)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Редактировать</button>
                                    <button onClick={() => setBulkTeamId(team.id)} className="btn-success" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Добавить игроков</button>
                                    <button onClick={() => setDeleteId(team.id)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Удалить</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewMode === 'list' && (
                <div className="table-wrapper">
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card)', borderRadius: '0.75rem', overflow: 'hidden', minWidth: '600px' }}>
                        <thead style={{ background: 'var(--primary)', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Название</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Город</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Тренер</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Игроков</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeams.map(team => (
                                <tr key={team.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => handleTeamClick(team.id, team.name)}>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{team.name}</td>
                                    <td style={{ padding: '0.75rem' }}>{team.city}</td>
                                    <td style={{ padding: '0.75rem' }}>{team.coachFullName || '—'}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{team.playerIds.length}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            <button onClick={() => openEditModal(team)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Редактировать</button>
                                            <button onClick={() => setBulkTeamId(team.id)} className="btn-success" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Добавить игроков</button>
                                            <button onClick={() => setDeleteId(team.id)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Удалить</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTeam ? 'Редактировать команду' : 'Новая команда'}>
                <TeamForm onSuccess={handleFormSuccess} initialData={editingTeam} onCancel={closeModal} />
            </Modal>

            {selectedTeamId && (
                <TeamPlayersModal
                    teamId={selectedTeamId}
                    teamName={selectedTeamName}
                    onClose={() => setSelectedTeamId(null)}
                    onSelectPlayer={handleSelectPlayer}
                />
            )}

            {selectedPlayerId && <PlayerDetailsModal playerId={selectedPlayerId} onClose={() => setSelectedPlayerId(null)} />}

            <ConfirmDialog
                open={!!deleteId}
                title="Удаление команды"
                message="Вы уверены, что хотите удалить эту команду?"
                warningText="Это действие необратимо. Вместе с командой будут удалены все её игроки и тренер."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />

            {bulkTeamId && (
                <BulkCreatePlayers
                    teamId={bulkTeamId}
                    teamName={teams.find(t => t.id === bulkTeamId)?.name}
                    onClose={() => setBulkTeamId(null)}
                    onSuccess={fetchTeams}
                />
            )}
        </div>
    );
};