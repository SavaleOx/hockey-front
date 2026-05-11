export interface AchievementRequestDto {
    name: string;
    description?: string;
}

export interface AchievementResponseDto {
    id: number;
    name: string;
    description?: string;
    playersCount: number;
}

export interface CoachRequestDto {
    name: string;
    surname: string;
    age: number;
    tactic?: string;
    teamId: number;
}

export interface CoachResponseDto {
    id: number;
    name: string;
    surname: string;
    age: number;
    tactic?: string;
    teamName: string;
}

export interface TeamRequestDto {
    name: string;
    city: string;
}

export interface TeamResponseDto {
    id: number;
    name: string;
    city: string;
    playerIds: number[];
    coachId?: number;
    coachFullName?: string;
}

export interface PlayerRequestDto {
    name: string;
    surname: string;
    number: number;
    age: number;
    teamId: number;
    position: 'GOALKEEPER' | 'DEFENDER' | 'FORWARD';
    goals: number;
    assists: number;
}

export interface PlayerResponseDto {
    id: number;
    fullName: string;
    number: number;
    age: number;
    goals: number;
    assists: number;
    points: number;
    teamName: string;
    positionName: string;
}

export interface PlayerSearchCriteria {
    playerId?: number;
    playerAge?: number;
    playerNumber?: number;
    teamName?: string;
    playerPosition?: string;
    minGoals?: number;
    maxGoals?: number;
    minAssists?: number;
    maxAssists?: number;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface StatisticRequestDto {
    playerId: number;
    season: number;
    goals: number;
    assists: number;
    games: number;
}

export interface StatisticResponseDto {
    id: number;
    playerId: number;
    playerName: string;
    season: number;
    goals: number;
    assists: number;
    games: number;
    points: number;
}

export interface PlayerInfoDto {
    id: number;
    fullName: string;
    number: number;
    teamName: string;
    goals: number;
    assists: number;
}

export interface AchievementPlayersDto {
    playersWithAchievement: PlayerInfoDto[];
    playersWithoutAchievement: PlayerInfoDto[];
}