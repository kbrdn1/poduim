export interface RankingTeam {
  id: string;
  name: string;
  tournamentId: string;
}

export interface RankingMatch {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string | null;
}

export interface TeamRanking {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export function calculateRanking(teams: RankingTeam[], matches: RankingMatch[]): TeamRanking[] {
  const rankings: Map<string, TeamRanking> = new Map();

  for (const team of teams) {
    rankings.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (match.status !== "completed" || match.homeScore === null || match.awayScore === null) {
      continue;
    }

    const homeTeam = rankings.get(match.homeTeamId);
    const awayTeam = rankings.get(match.awayTeamId);

    if (!homeTeam || !awayTeam) continue;

    homeTeam.played++;
    awayTeam.played++;

    homeTeam.goalsFor += match.homeScore;
    homeTeam.goalsAgainst += match.awayScore;
    awayTeam.goalsFor += match.awayScore;
    awayTeam.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      homeTeam.won++;
      homeTeam.points += 3;
      awayTeam.lost++;
    } else if (match.homeScore < match.awayScore) {
      awayTeam.won++;
      awayTeam.points += 3;
      homeTeam.lost++;
    } else {
      homeTeam.drawn++;
      awayTeam.drawn++;
      homeTeam.points += 1;
      awayTeam.points += 1;
    }
  }

  for (const ranking of rankings.values()) {
    ranking.goalDifference = ranking.goalsFor - ranking.goalsAgainst;
  }

  return Array.from(rankings.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });
}
