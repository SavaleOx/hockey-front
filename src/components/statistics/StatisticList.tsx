import { useEffect, useState } from 'react';
import { statisticApi, playerApi } from '../../services/api';
import { StatisticForm } from './StatisticForm';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';
import type { StatisticResponseDto, PlayerResponseDto } from '../../types/index';

export const StatisticList = () => {
    const [players, setPlayers] = useState<PlayerResponseDto[]>([]);
    const [stats, setStats] = useState<StatisticResponseDto[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerResponseDto | null>(null);
    const [seasonFilter, setSeasonFilter] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [editingStat, setEditingStat] = useState<StatisticResponseDto | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [existingSeasons, setExistingSeasons] = useState<number[]>([]); // существующие сезоны для игрока

    const currentYear = new Date().getFullYear();

    // Загружаем список игроков
    useEffect(() => {
        const fetchPlayers = async () => {
            const res = await playerApi.getAll();
            setPlayers(res.data);
        };
        fetchPlayers();
    }, []);

    // Загружаем статистику и обновляем список существующих сезонов
    useEffect(() => {
        if (!selectedPlayer) {
            setStats([]);
            setExistingSeasons([]);
            return;
        }
        const fetchStats = async () => {
            setLoading(true);
            try {
                const season = seasonFilter ? Number(seasonFilter) : undefined;
                const res = await statisticApi.getByPlayer(selectedPlayer.id, season);
                setStats(res.data);
                // Если фильтр не активен, сохраняем все сезоны для проверки дубликатов
                if (!seasonFilter) {
                    const seasons = res.data.map(s => s.season);
                    setExistingSeasons(seasons);
                } else {
                    // Если фильтр активен, всё равно нужно получить все сезоны (для проверки дубликатов)
                    const allStatsRes = await statisticApi.getByPlayer(selectedPlayer.id);
                    const allSeasons = allStatsRes.data.map(s => s.season);
                    setExistingSeasons(allSeasons);
                }
            } catch (err) {
                console.error(err);
                alert('Ошибка загрузки статистики');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedPlayer, seasonFilter]);

    const handleSelectPlayer = (player: PlayerResponseDto) => {
        setSelectedPlayer(player);
        setSeasonFilter('');
    };

    // Сброс фильтра сезона
    const resetSeasonFilter = () => {
        setSeasonFilter('');
    };

    // Вычисляем допустимый диапазон сезонов для игрока (минимальный – с 16 лет)
    const getMinSeason = (playerAge: number) => {
        const minAllowedAge = 16;
        if (playerAge < minAllowedAge) return null;
        return currentYear - (playerAge - minAllowedAge);
    };

    const minSeason = selectedPlayer ? getMinSeason(selectedPlayer.age) : null;
    const isTooYoung = selectedPlayer && selectedPlayer.age < 16;

    const handleSeasonFilterChange = (value: string) => {
        let num = value ? Number(value) : NaN;
        if (isNaN(num)) {
            setSeasonFilter('');
            return;
        }
        if (minSeason !== null && num < minSeason) num = minSeason;
        if (num > currentYear) num = currentYear;
        setSeasonFilter(String(num));
    };

    const handleDelete = async () => {
        if (deleteId) {
            setLoading(true);
            await statisticApi.delete(deleteId);
            setDeleteId(null);
            if (selectedPlayer) {
                const season = seasonFilter ? Number(seasonFilter) : undefined;
                const res = await statisticApi.getByPlayer(selectedPlayer.id, season);
                setStats(res.data);
                // Обновить список существующих сезонов
                const allStatsRes = await statisticApi.getByPlayer(selectedPlayer.id);
                setExistingSeasons(allStatsRes.data.map(s => s.season));
            }
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingStat(null);
        setIsModalOpen(true);
    };

    const openEditModal = (stat: StatisticResponseDto) => {
        setEditingStat(stat);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStat(null);
    };

    const handleFormSuccess = async () => {
        if (selectedPlayer) {
            const season = seasonFilter ? Number(seasonFilter) : undefined;
            const res = await statisticApi.getByPlayer(selectedPlayer.id, season);
            setStats(res.data);
            // Обновить список существующих сезонов
            const allStatsRes = await statisticApi.getByPlayer(selectedPlayer.id);
            setExistingSeasons(allStatsRes.data.map(s => s.season));
        }
        closeModal();
    };

    const filteredPlayers = players.filter(p =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '1rem', maxWidth: '1280px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Статистика игроков</h1>

            <div style={{
                marginBottom: '1.5rem',
                background: 'var(--bg-card)',
                borderRadius: '0.75rem',
                padding: '1rem',
                border: '1px solid var(--border)'
            }}>
                <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>Выберите игрока:</label>
                <input
                    type="text"
                    placeholder="Поиск по имени..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        marginBottom: '0.75rem',
                        border: '1px solid var(--border)',
                        borderRadius: '0.375rem',
                        background: 'var(--bg-card)',
                        color: 'var(--text-dark)'
                    }}
                />
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.25rem' }}>
                    {filteredPlayers.length === 0 && <p style={{ padding: '0.5rem', textAlign: 'center', opacity: 0.7 }}>Игроки не найдены</p>}
                    {filteredPlayers.map(p => (
                        <div
                            key={p.id}
                            onClick={() => handleSelectPlayer(p)}
                            style={{
                                padding: '0.5rem',
                                cursor: 'pointer',
                                borderRadius: '0.25rem',
                                background: selectedPlayer?.id === p.id ? 'var(--accent)' : 'transparent',
                                color: selectedPlayer?.id === p.id ? 'white' : 'var(--text-dark)',
                                transition: 'background 0.1s'
                            }}
                            onMouseEnter={e => {
                                if (selectedPlayer?.id !== p.id) e.currentTarget.style.background = 'var(--border)';
                            }}
                            onMouseLeave={e => {
                                if (selectedPlayer?.id !== p.id) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {p.fullName} – {p.teamName} ({p.age} лет)
                        </div>
                    ))}
                </div>
            </div>

            {selectedPlayer && (
                <>
                    {isTooYoung ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem',
                            border: '1px dashed var(--danger)',
                            borderRadius: '0.75rem',
                            color: 'var(--danger)',
                            marginBottom: '1rem'
                        }}>
                            ⚠️ Игроку меньше 16 лет. Статистику пока добавить нельзя.
                        </div>
                    ) : (
                        <>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 'bold' }}>Сезон:</label>
                                    <input
                                        type="number"
                                        placeholder="Все сезоны"
                                        value={seasonFilter}
                                        onChange={e => handleSeasonFilterChange(e.target.value)}
                                        style={{
                                            padding: '0.3rem 0.5rem',
                                            width: '100px',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0.375rem',
                                            background: 'var(--bg-card)',
                                            color: 'var(--text-dark)'
                                        }}
                                        min={minSeason !== null ? minSeason : undefined}
                                        max={currentYear}
                                    />
                                    <button
                                        onClick={resetSeasonFilter}
                                        className="btn-secondary"
                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        title="Все сезоны"
                                    >
                                        ✖ Все сезоны
                                    </button>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                        (доступно с {minSeason} по {currentYear})
                                    </span>
                                </div>
                                <button onClick={openCreateModal} className="btn-primary">Добавить статистику</button>
                            </div>

                            {loading && <div className="loading-spinner" style={{ margin: '2rem auto' }} />}
                            {!loading && stats.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border)', borderRadius: '0.75rem' }}>
                                    Нет статистики для выбранного сезона. Нажмите «Добавить статистику».
                                </div>
                            )}

                            {stats.length > 0 && (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card)', borderRadius: '0.75rem' }}>
                                        <thead style={{ background: 'var(--primary)', color: 'white' }}>
                                            <tr>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Сезон</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Игры</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Голы</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Передачи</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Очки</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.map(s => (
                                                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '0.75rem' }}>{s.season}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{s.games}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{s.goals}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{s.assists}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{s.points}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                            <button onClick={() => openEditModal(s)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Редактировать</button>
                                                            <button onClick={() => setDeleteId(s.id)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Удалить</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {!selectedPlayer && (
                <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border)', borderRadius: '0.75rem' }}>
                    Выберите игрока, чтобы увидеть его статистику.
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingStat ? 'Редактировать статистику' : 'Добавить статистику'}>
                <StatisticForm
                    playerId={selectedPlayer?.id}
                    playerAge={selectedPlayer?.age}
                    existingSeasons={existingSeasons}
                    editId={editingStat?.id}
                    onSuccess={handleFormSuccess}
                    initialData={editingStat}
                    onCancel={closeModal}
                />
            </Modal>

            <ConfirmDialog
                open={!!deleteId}
                title="Удаление статистики"
                message="Вы уверены, что хотите удалить эту запись?"
                warningText="Будут обновлены суммарные голы и передачи игрока. Действие необратимо."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};