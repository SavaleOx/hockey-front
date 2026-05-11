import { Modal } from '../common/Modal';
import type { AchievementResponseDto } from '../../types/index';

interface Props {
    achievement: AchievementResponseDto;
    onClose: () => void;
}

const getDeclension = (n: number, one: string, few: string, many: string) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
};

export const AchievementDetailsModal = ({ achievement, onClose }: Props) => {
    return (
        <Modal isOpen={true} onClose={onClose} title={`Достижение: ${achievement.name}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {achievement.description && (
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Описание</h3>
                        <p style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{achievement.description}</p>
                    </div>
                )}
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Владельцы</h3>
                    <p> {achievement.playersCount} {getDeclension(achievement.playersCount, 'игрок', 'игрока', 'игроков')} имеют это достижение</p>
                </div>
            </div>
        </Modal>
    );
};