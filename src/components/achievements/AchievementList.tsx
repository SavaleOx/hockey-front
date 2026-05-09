import { useEffect, useState } from 'react';
import { achievementApi } from '../../services/api';
import { AchievementForm } from './AchievementForm';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';
import { AchievementPlayersModal } from './AchievementPlayersModal';
import { AchievementDetailsModal } from './AchievementDetailsModal';
import type { AchievementResponseDto } from '../../types/index';

// Функция склонения для русских существительных
const getDeclension = (n: number, one: string, few: string, many: string) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
};

export const AchievementList = () => {
    const [achievements, setAchievements] = useState<AchievementResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        return (localStorage.getItem('achievementViewMode') as 'grid' | 'list') || 'grid';
    });
    const [editing, setEditing] = useState<AchievementResponseDto | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [playersModalAchievement, setPlayersModalAchievement] = useState<AchievementResponseDto | null>(null);
    const [detailsModalAchievement, setDetailsModalAchievement] = useState<AchievementResponseDto | null>(null);

    useEffect(() => {
        localStorage.setItem('achievementViewMode', viewMode);
    }, [viewMode]);

    const fetchAchievements = async () => {
        setLoading(true);
        try {
            const res = await achievementApi.getAll();
            setAchievements(res.data);
        } catch (err) {
            console.error(err);
            alert('Ошибка загрузки достижений');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, []);

    const handleDelete = async () => {
        if (deleteId) {
            setLoading(true);
            await achievementApi.delete(deleteId);
            setDeleteId(null);
            await fetchAchievements();
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditing(null);
        setIsModalOpen(true);
    };

    const openEditModal = (achievement: AchievementResponseDto) => {
        setEditing(achievement);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditing(null);
    };

    const handleFormSuccess = async () => {
        await fetchAchievements();
        closeModal();
    };

    const filteredAchievements = achievements.filter(ach =>
        ach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ach.description && ach.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>🏆 Достижения</h1>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="🔍 Поиск по названию или описанию..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.5rem 0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            background: 'var(--bg-card)',
                            color: 'var(--text-dark)',
                            minWidth: '260px'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        <button onClick={() => setViewMode('grid')} style={{ padding: '0.5rem 0.75rem', background: viewMode === 'grid' ? 'var(--accent)' : 'transparent', border: 'none', borderRadius: '0.5rem 0 0 0.5rem', cursor: 'pointer', color: viewMode === 'grid' ? 'white' : 'var(--text-dark)' }}>
                            📱 Сетка
                        </button>
                        <button onClick={() => setViewMode('list')} style={{ padding: '0.5rem 0.75rem', background: viewMode === 'list' ? 'var(--accent)' : 'transparent', border: 'none', borderRadius: '0 0.5rem 0.5rem 0', cursor: 'pointer', color: viewMode === 'list' ? 'white' : 'var(--text-dark)' }}>
                            📋 Список
                        </button>
                    </div>
                    <button onClick={openCreateModal} className="btn-primary">➕ Создать достижение</button>
                </div>
            </div>

            {loading && <div className="loading-spinner" style={{ margin: '2rem auto' }} />}
            {!loading && filteredAchievements.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Достижения не найдены.</div>
            )}

            {viewMode === 'grid' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredAchievements.map(ach => (
                        <div key={ach.id} className="list-item" style={{ padding: '1rem', borderRadius: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div
                                    style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                                    onClick={() => setDetailsModalAchievement(ach)}
                                >
                                    <h3 style={{
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {ach.name}
                                    </h3>
                                    {ach.description && (
                                        <p style={{
                                            fontSize: '0.85rem',
                                            opacity: 0.8,
                                            marginTop: '0.25rem',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {ach.description}
                                        </p>
                                    )}
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                        <span style={{ background: 'var(--accent)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                                            👥 {ach.playersCount} {getDeclension(ach.playersCount, 'игрок', 'игрока', 'игроков')}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}>
                                    <button onClick={() => openEditModal(ach)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>✏️ Edit</button>
                                    <button onClick={() => setPlayersModalAchievement(ach)} className="btn-success" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>👥 Игроки</button>
                                    <button onClick={() => setDeleteId(ach.id)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>🗑️ Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewMode === 'list' && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card)', borderRadius: '0.75rem' }}>
                        <thead style={{ background: 'var(--primary)', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Название</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Описание</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Игроков</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAchievements.map(ach => (
                                <tr key={ach.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem', cursor: 'pointer' }} onClick={() => setDetailsModalAchievement(ach)}>
                                        <strong>{ach.name}</strong>
                                    </td>
                                    <td style={{ padding: '0.75rem', opacity: 0.85, cursor: 'pointer' }} onClick={() => setDetailsModalAchievement(ach)}>
                                        {ach.description || '—'}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{ach.playersCount}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button onClick={() => openEditModal(ach)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>✏️ Edit</button>
                                            <button onClick={() => setPlayersModalAchievement(ach)} className="btn-success" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>👥 Игроки</button>
                                            <button onClick={() => setDeleteId(ach.id)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>🗑️ Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editing ? '✏️ Редактировать достижение' : '➕ Новое достижение'}>
                <AchievementForm onSuccess={handleFormSuccess} initialData={editing} onCancel={closeModal} />
            </Modal>

            {playersModalAchievement && (
                <AchievementPlayersModal
                    achievementId={playersModalAchievement.id}
                    achievementName={playersModalAchievement.name}
                    onClose={() => setPlayersModalAchievement(null)}
                    onUpdate={fetchAchievements}
                />
            )}

            {detailsModalAchievement && (
                <AchievementDetailsModal
                    achievement={detailsModalAchievement}
                    onClose={() => setDetailsModalAchievement(null)}
                />
            )}

            <ConfirmDialog
                open={!!deleteId}
                title="Удаление достижения"
                message="Вы уверены, что хотите удалить это достижение?"
                warningText="Достижение будет удалено у всех игроков, которые его имеют. Это действие необратимо."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};