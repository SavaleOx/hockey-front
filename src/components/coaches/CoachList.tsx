import { useEffect, useState } from 'react';
import { coachApi } from '../../services/api';
import { CoachForm } from './CoachForm';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';
import type { CoachResponseDto } from '../../types/index';

export const CoachList = () => {
    const [coaches, setCoaches] = useState<CoachResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingCoach, setEditingCoach] = useState<CoachResponseDto | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        return (localStorage.getItem('coachViewMode') as 'grid' | 'list') || 'grid';
    });

    useEffect(() => {
        localStorage.setItem('coachViewMode', viewMode);
    }, [viewMode]);

    const fetchCoaches = async () => {
        setLoading(true);
        try {
            const res = await coachApi.getAll();
            setCoaches(res.data);
        } catch (err) {
            console.error(err);
            alert('Ошибка загрузки тренеров');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoaches();
    }, []);

    const handleDelete = async () => {
        if (deleteId) {
            setLoading(true);
            await coachApi.delete(deleteId);
            setDeleteId(null);
            await fetchCoaches();
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingCoach(null);
        setIsModalOpen(true);
    };

    const openEditModal = (coach: CoachResponseDto) => {
        setEditingCoach(coach);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCoach(null);
    };

    const handleFormSuccess = async () => {
        await fetchCoaches();
        closeModal();
    };

    const filteredCoaches = coaches.filter(coach =>
        `${coach.name} ${coach.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.surname.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🧑‍🏫 Тренеры
                    <span style={{ fontSize: '0.875rem', background: 'var(--border)', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                        {filteredCoaches.length}
                    </span>
                </h1>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="🔍 Поиск по имени или фамилии..."
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
                        <button onClick={() => setViewMode('grid')} style={{ padding: '0.5rem 0.75rem', background: viewMode === 'grid' ? 'var(--accent)' : 'transparent', border: 'none', borderRadius: '0.5rem 0 0 0.5rem', cursor: 'pointer', color: viewMode === 'grid' ? 'white' : 'var(--text-dark)' }}>📱 Сетка</button>
                        <button onClick={() => setViewMode('list')} style={{ padding: '0.5rem 0.75rem', background: viewMode === 'list' ? 'var(--accent)' : 'transparent', border: 'none', borderRadius: '0 0.5rem 0.5rem 0', cursor: 'pointer', color: viewMode === 'list' ? 'white' : 'var(--text-dark)' }}>📋 Список</button>
                    </div>
                    <button onClick={openCreateModal} className="btn-primary">➕ Создать тренера</button>
                </div>
            </div>

            {loading && <div className="loading-spinner" style={{ margin: '2rem auto' }} />}
            {!loading && filteredCoaches.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Тренеры не найдены.</div>
            )}

            {viewMode === 'grid' && (
                <div className="grid-view">
                    {filteredCoaches.map(c => (
                        <div key={c.id} className="list-item" style={{ padding: '1rem', borderRadius: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{c.name} {c.surname}</h3>
                                    <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Возраст: {c.age} лет</div>
                                    <div style={{ fontSize: '0.9rem' }}>Команда: {c.teamName}</div>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Тактика: {c.tactic || '—'}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}>
                                    <button onClick={() => openEditModal(c)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>✏️ Редактировать</button>
                                    <button onClick={() => setDeleteId(c.id)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>🗑️ Удалить</button>
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
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Тренер</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Возраст</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Команда</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Тактика</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCoaches.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem' }}><strong>{c.name} {c.surname}</strong></td>
                                    <td style={{ padding: '0.75rem' }}>{c.age}</td>
                                    <td style={{ padding: '0.75rem' }}>{c.teamName}</td>
                                    <td style={{ padding: '0.75rem' }}>{c.tactic || '—'}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            <button onClick={() => openEditModal(c)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>✏️ Редактировать</button>
                                            <button onClick={() => setDeleteId(c.id)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>🗑️ Удалить</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCoach ? '✏️ Редактировать тренера' : '➕ Новый тренер'}>
                <CoachForm onSuccess={handleFormSuccess} initialData={editingCoach} onCancel={closeModal} />
            </Modal>

            <ConfirmDialog
                open={!!deleteId}
                title="Удаление тренера"
                message="Вы уверены, что хотите удалить этого тренера?"
                warningText="Это действие необратимо."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};