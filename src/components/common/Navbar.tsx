import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-top">
                    <div className="navbar-brand">
                        Хоккейный менеджер
                    </div>
                    <button onClick={toggleTheme} className="theme-toggle">
                        {theme === 'light' ? '🌙 Тёмная тема' : '☀️ Светлая тема'}
                    </button>
                </div>
                <div className="navbar-links">
                    <NavLink to="/teams" className={({ isActive }) => isActive ? 'active' : ''}>
                        🏒 Команды
                    </NavLink>
                    <NavLink to="/players" className={({ isActive }) => isActive ? 'active' : ''}>
                        👥 Игроки
                    </NavLink>
                    <NavLink to="/coaches" className={({ isActive }) => isActive ? 'active' : ''}>
                        🧑‍🏫 Тренеры
                    </NavLink>
                    <NavLink to="/achievements" className={({ isActive }) => isActive ? 'active' : ''}>
                        🏆 Достижения
                    </NavLink>
                    <NavLink to="/statistics" className={({ isActive }) => isActive ? 'active' : ''}>
                        📊 Статистика
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};