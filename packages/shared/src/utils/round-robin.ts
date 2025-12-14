import type { RankingTeam } from "./ranking";

export interface GeneratedMatch {
  homeTeamId: string;
  awayTeamId: string;
  round: number;
  matchNumber: number;
}

export function generateRoundRobinMatches(teams: RankingTeam[]): GeneratedMatch[] {
  const matches: GeneratedMatch[] = [];
  const n = teams.length;

  if (n < 2) return matches;

  const teamIds = teams.map((t) => t.id);
  const isOdd = n % 2 !== 0;

  if (isOdd) {
    teamIds.push("BYE");
  }

  const totalTeams = teamIds.length;
  const rounds = totalTeams - 1;
  const matchesPerRound = totalTeams / 2;

  let matchNumber = 1;

  for (let round = 0; round < rounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (totalTeams - 1);
      let away = (totalTeams - 1 - match + round) % (totalTeams - 1);

      if (match === 0) {
        away = totalTeams - 1;
      }

      const homeTeamId = teamIds[home];
      const awayTeamId = teamIds[away];

      if (homeTeamId !== "BYE" && awayTeamId !== "BYE") {
        matches.push({
          homeTeamId,
          awayTeamId,
          round: round + 1,
          matchNumber: matchNumber++,
        });
      }
    }
  }

  return matches;
}
