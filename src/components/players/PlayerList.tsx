import { useEffect, useState } from 'react';
import { playerApi, teamApi } from '../../services/api';
import { PlayerFilters } from './PlayerFilters';
import { Pagination } from '../common/Pagination';
import { PlayerForm } from './PlayerForm';
import { PlayerAchievements } from './PlayerAchievements';
import { PlayerDetailsModal } from './PlayerDetailsModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';
import type { PlayerResponseDto, TeamResponseDto } from '../../types/index';

// Маппинг позиций на русский язык
const getRussianPosition = (positionName: string): string => {
    switch (positionName) {
        case 'GOALKEEPER': return 'Вратарь';
        case 'DEFENDER': return 'Защитник';
        case 'FORWARD': return 'Нападающий';
        default: return positionName;
    }
};

export const PlayerList = () => {
    const [allPlayers, setAllPlayers] = useState<PlayerResponseDto[]>([]);
    const [teams, setTeams] = useState<TeamResponseDto[]>([]);
    const [filteredPlayers, setFilteredPlayers] = useState<PlayerResponseDto[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [size] = useState(15);
    const [loading, setLoading] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<PlayerResponseDto | null>(null);
    const [showAchievementsFor, setShowAchievementsFor] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        return (localStorage.getItem('playerViewMode') as 'grid' | 'list') || 'grid';
    });
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
    const [filters, setFilters] = useState<{
        teamName?: string;
        position?: string;
        minGoals?: number;
        maxGoals?: number;
        minAssists?: number;
        maxAssists?: number;
        minAge?: number;
        maxAge?: number;
    }>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const [playersRes, teamsRes] = await Promise.all([
                playerApi.getAll(),
                teamApi.getAll()
            ]);
            setAllPlayers(playersRes.data);
            setTeams(teamsRes.data);
        } catch (err) {
            console.error(err);
            alert('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...allPlayers];
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => p.fullName.toLowerCase().includes(term));
        }
        if (filters.teamName) filtered = filtered.filter(p => p.teamName === filters.teamName);
        if (filters.position) filtered = filtered.filter(p => p.positionName === filters.position);
        if (filters.minGoals !== undefined) filtered = filtered.filter(p => p.goals >= filters.minGoals!);
        if (filters.maxGoals !== undefined) filtered = filtered.filter(p => p.goals <= filters.maxGoals!);
        if (filters.minAssists !== undefined) filtered = filtered.filter(p => p.assists >= filters.minAssists!);
        if (filters.maxAssists !== undefined) filtered = filtered.filter(p => p.assists <= filters.maxAssists!);
        if (filters.minAge !== undefined) filtered = filtered.filter(p => p.age >= filters.minAge!);
        if (filters.maxAge !== undefined) filtered = filtered.filter(p => p.age <= filters.maxAge!);
        setFilteredPlayers(filtered);
        setPage(0);
    }, [allPlayers, searchTerm, filters]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredPlayers.length / size));
    }, [filteredPlayers, size]);

    const paginatedPlayers = filteredPlayers.slice(page * size, (page + 1) * size);

    const handleDelete = async () => {
        if (deleteId) {
            setLoading(true);
            await playerApi.delete(deleteId);
            setDeleteId(null);
            await fetchData();
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingPlayer(null);
        setIsModalOpen(true);
    };

    const openEditModal = (player: PlayerResponseDto) => {
        setEditingPlayer(player);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPlayer(null);
    };

    const handleFormSuccess = async () => {
        await fetchData();
        closeModal();
    };

    const handlePlayerClick = (playerId: number) => {
        setSelectedPlayerId(playerId);
    };

    const resetFilters = () => {
        setFilters({});
        setSearchTerm('');
    };

    useEffect(() => {
        localStorage.setItem('playerViewMode', viewMode);
    }, [viewMode]);

    return (
        <div style={{ padding: '1rem', maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                gap: '1rem'
            }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Игроки
                    <span style={{ fontSize: '0.875rem', background: 'var(--border)', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                        {filteredPlayers.length}
                    </span>
                </h1>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Поиск по имени..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.5rem 0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            background: 'var(--bg-card)',
                            color: 'var(--text-dark)',
                            minWidth: '220px'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        <button onClick={() => setViewMode('grid')} style={{ padding: '0.5rem 0.75rem', background: viewMode === 'grid' ? 'var(--accent)' : 'transparent', border: 'none', borderRadius: '0.5rem 0 0 0.5rem', cursor: 'pointer', color: viewMode === 'grid' ? 'white' : 'var(--text-dark)' }}>Сетка</button>
                        <button onClick={() => setViewMode('list')} style={{ padding: '0.5rem 0.75rem', background: viewMode === 'list' ? 'var(--accent)' : 'transparent', border: 'none', borderRadius: '0 0.5rem 0.5rem 0', cursor: 'pointer', color: viewMode === 'list' ? 'white' : 'var(--text-dark)' }}>Список</button>
                    </div>
                    <button onClick={openCreateModal} className="btn-primary">Создать игрока</button>
                </div>
            </div>

            <PlayerFilters
                teams={teams.map(t => ({ id: t.id, name: t.name }))}
                onFilterChange={setFilters}
                onReset={resetFilters}
            />

            {loading && <div className="loading-spinner" style={{ margin: '2rem auto' }} />}
            {!loading && filteredPlayers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Игроки не найдены.</div>
            )}

            {viewMode === 'grid' && (
                <div className="grid-view">
                    {paginatedPlayers.map(p => (
                        <div key={p.id} className="list-item" style={{ padding: '1rem', borderRadius: '0.75rem', cursor: 'pointer' }} onClick={() => handlePlayerClick(p.id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{p.fullName} <span style={{ fontSize: '0.8rem', background: 'var(--border)', padding: '0.1rem 0.4rem', borderRadius: '999px' }}>#{p.number}</span></h3>
                                    <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{getRussianPosition(p.positionName)} • {p.teamName}</div>
                                    <div style={{ fontSize: '0.85rem' }}> {p.goals}  {p.assists} |  {p.points} очков</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                                    <button onClick={() => openEditModal(p)} className="btn-primary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Редактировать</button>
                                    <button onClick={() => setShowAchievementsFor(p.id)} className="btn-success" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Добавить</button>
                                    <button onClick={() => setDeleteId(p.id)} className="btn-danger" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Удалить</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewMode === 'list' && (
                <div className="table-wrapper">
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card)', borderRadius: '0.75rem', overflow: 'hidden', minWidth: '700px' }}>
                        <thead style={{ background: 'var(--primary)', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Игрок</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Позиция</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Команда</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Голы</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Передачи</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Очки</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPlayers.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => handlePlayerClick(p.id)}>
                                    <td style={{ padding: '0.75rem' }}><strong>{p.fullName}</strong> (#{p.number})</td>
                                    <td style={{ padding: '0.75rem' }}>{getRussianPosition(p.positionName)}</td>
                                    <td style={{ padding: '0.75rem' }}>{p.teamName}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}> {p.goals}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}> {p.assists}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}> {p.points}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            <button onClick={() => openEditModal(p)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Редактировать</button>
                                            <button onClick={() => setShowAchievementsFor(p.id)} className="btn-success" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Добавить</button>
                                            <button onClick={() => setDeleteId(p.id)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Удалить</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPlayer ? 'Редактировать игрока' : 'Новый игрок'}>
                <PlayerForm onSuccess={handleFormSuccess} initialData={editingPlayer} onCancel={closeModal} />
            </Modal>

            {showAchievementsFor && (
                <PlayerAchievements playerId={showAchievementsFor} onClose={() => setShowAchievementsFor(null)} />
            )}
            {selectedPlayerId && (
                <PlayerDetailsModal playerId={selectedPlayerId} onClose={() => setSelectedPlayerId(null)} />
            )}

            <ConfirmDialog
                open={!!deleteId}
                title="Удаление игрока"
                message="Вы уверены, что хотите удалить этого игрока?"
                warningText="Это действие необратимо. Вся статистика игрока будет удалена."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};