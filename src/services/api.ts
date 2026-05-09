import axios from 'axios';
import type {
  AchievementRequestDto,
  AchievementResponseDto,
  AchievementPlayersDto,
  CoachRequestDto,
  CoachResponseDto,
  TeamRequestDto,
  TeamResponseDto,
  PlayerRequestDto,
  PlayerResponseDto,
  PlayerSearchCriteria,
  PageResponse,
  StatisticRequestDto,
  StatisticResponseDto,
  PlayerInfoDto,
} from '../types/index';

const api = axios.create({
    baseURL: 'http://localhost:8081',
    headers: { 'Content-Type': 'application/json' }
});

// ========== Achievement ==========
export const achievementApi = {
    getAll: () => api.get<AchievementResponseDto[]>('/achievements'),
    getById: (id: number) => api.get<AchievementResponseDto>(`/achievements/${id}`),
    getByName: (name: string) => api.get<AchievementResponseDto>(`/achievements/by-name?name=${name}`),
    create: (dto: AchievementRequestDto) => api.post<AchievementResponseDto>('/achievements', dto),
    update: (id: number, dto: AchievementRequestDto) => api.put<AchievementResponseDto>(`/achievements/${id}`, dto),
    patch: (id: number, dto: AchievementRequestDto) => api.patch<AchievementResponseDto>(`/achievements/${id}`, dto),
    delete: (id: number) => api.delete(`/achievements/${id}`),
    // НОВЫЙ МЕТОД: получить игроков с достижением и без него
    getPlayers: (id: number) => api.get<AchievementPlayersDto>(`/achievements/${id}/players`),
};

// ========== Coach ==========
export const coachApi = {
    getAll: () => api.get<CoachResponseDto[]>('/coaches'),
    getById: (id: number) => api.get<CoachResponseDto>(`/coaches/${id}`),
    getByTeam: (teamId: number) => api.get<CoachResponseDto[]>(`/coaches/by-team?teamId=${teamId}`),
    create: (dto: CoachRequestDto) => api.post<CoachResponseDto>('/coaches', dto),
    update: (id: number, dto: CoachRequestDto) => api.put<CoachResponseDto>(`/coaches/${id}`, dto),
    patch: (id: number, dto: CoachRequestDto) => api.patch<CoachResponseDto>(`/coaches/${id}`, dto),
    delete: (id: number) => api.delete(`/coaches/${id}`),
};

// ========== Team ==========
export const teamApi = {
    getAll: () => api.get<TeamResponseDto[]>('/teams'),
    getById: (id: number) => api.get<TeamResponseDto>(`/teams/${id}`),
    create: (dto: TeamRequestDto) => api.post<TeamResponseDto>('/teams', dto),
    update: (id: number, dto: TeamRequestDto) => api.put<TeamResponseDto>(`/teams/${id}`, dto),
    patch: (id: number, dto: TeamRequestDto) => api.patch<TeamResponseDto>(`/teams/${id}`, dto),
    delete: (id: number) => api.delete(`/teams/${id}`),
    bulkCreatePlayers: (teamId: number, players: PlayerRequestDto[]) =>
        api.post<PlayerResponseDto[]>(`/teams/${teamId}/players/bulk`, players),
};

// ========== Player ==========
export const playerApi = {
    getAll: (params?: { teamId?: number; position?: string; minGoals?: number }) =>
        api.get<PlayerResponseDto[]>('/players', { params }),
    getById: (id: number) => api.get<PlayerResponseDto>(`/players/${id}`),
    create: (dto: PlayerRequestDto) => api.post<PlayerResponseDto>('/players', dto),
    update: (id: number, dto: PlayerRequestDto) => api.put<PlayerResponseDto>(`/players/${id}`, dto),
    patch: (id: number, dto: PlayerRequestDto) => api.patch<PlayerResponseDto>(`/players/${id}`, dto),
    delete: (id: number) => api.delete(`/players/${id}`),
    searchJPQL: (criteria: PlayerSearchCriteria, page: number, size: number) =>
        api.get<PageResponse<PlayerResponseDto>>('/players/search', {
            params: { ...criteria, page, size }
        }),
    addAchievement: (playerId: number, achievementId: number) =>
        api.post<PlayerResponseDto>(`/players/${playerId}/achievements/${achievementId}`),
    removeAchievement: (playerId: number, achievementId: number) =>
        api.delete<PlayerResponseDto>(`/players/${playerId}/achievements/${achievementId}`),
    getPlayerAchievements: (playerId: number) =>
        api.get<AchievementResponseDto[]>(`/players/${playerId}/achievements`),
    setAchievements: (playerId: number, achievementIds: number[]) =>
        api.put<PlayerResponseDto>(`/players/${playerId}/achievements`, achievementIds),
};

// ========== Statistic ==========
export const statisticApi = {
    getByPlayer: (playerId: number, season?: number) =>
        api.get<StatisticResponseDto[]>('/statistics', { params: { playerId, season } }),
    create: (dto: StatisticRequestDto) => api.post<StatisticResponseDto>('/statistics', dto),
    update: (id: number, dto: StatisticRequestDto) => api.put<StatisticResponseDto>(`/statistics/${id}`, dto),
    patch: (id: number, dto: StatisticRequestDto) => api.patch<StatisticResponseDto>(`/statistics/${id}`, dto),
    delete: (id: number) => api.delete(`/statistics/${id}`),
};