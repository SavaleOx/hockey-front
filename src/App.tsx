import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { TeamsPage } from './pages/TeamsPage';
import { PlayersPage } from './pages/PlayersPage';
import { CoachesPage } from './pages/CoachesPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <div className="container mx-auto">
          <Routes>
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/coaches" element={<CoachesPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/" element={<TeamsPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
export default App;