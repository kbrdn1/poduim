import { db } from "./index";
import { tournaments, teams, matches, users, tournamentSubscriptions } from "./schema";

const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "@Admin123";
const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD || "@User123";

interface UserData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: "admin" | "viewer";
}

const adminUsers: UserData[] = [
  { email: "admin@poduim.io", username: "admin", firstName: "Admin", lastName: "User", role: "admin" },
];

const viewerUsers: UserData[] = [
  { email: "user1@poduim.io", username: "charlie", firstName: "Charlie", lastName: "User", role: "viewer" },
  { email: "user2@poduim.io", username: "diana", firstName: "Diana", lastName: "User", role: "viewer" },
  { email: "user3@poduim.io", username: "ethan", firstName: "Ethan", lastName: "User", role: "viewer" },
  { email: "user4@poduim.io", username: "fiona", firstName: "Fiona", lastName: "User", role: "viewer" },
  { email: "user5@poduim.io", username: "george", firstName: "George", lastName: "User", role: "viewer" },
  { email: "user6@poduim.io", username: "hannah", firstName: "Hannah", lastName: "User", role: "viewer" },
  { email: "user7@poduim.io", username: "ivan", firstName: "Ivan", lastName: "User", role: "viewer" },
  { email: "user8@poduim.io", username: "julia", firstName: "Julia", lastName: "User", role: "viewer" },
  { email: "user9@poduim.io", username: "kevin", firstName: "Kevin", lastName: "User", role: "viewer" },
  { email: "user10@poduim.io", username: "laura", firstName: "Laura", lastName: "User", role: "viewer" },
];

function generateId(): string {
  return crypto.randomUUID();
}

interface TeamData {
  name: string;
  city: string;
}

interface MatchData {
  round: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: Date;
}


const ligue1Teams: TeamData[] = [
  { name: "Paris Saint-Germain", city: "Paris" },
  { name: "Monaco", city: "Monaco" },
  { name: "Marseille", city: "Marseille" },
  { name: "Lille", city: "Lille" },
  { name: "Lyon", city: "Lyon" },
  { name: "Nice", city: "Nice" },
  { name: "Lens", city: "Lens" },
  { name: "Stade Brestois", city: "Brest" },
  { name: "Toulouse", city: "Toulouse" },
  { name: "Strasbourg", city: "Strasbourg" },
  { name: "Auxerre", city: "Auxerre" },
  { name: "Nantes", city: "Nantes" },
  { name: "Reims", city: "Reims" },
  { name: "Angers", city: "Angers" },
  { name: "Rennes", city: "Rennes" },
  { name: "Le Havre", city: "Le Havre" },
  { name: "Montpellier", city: "Montpellier" },
  { name: "Saint-Étienne", city: "Saint-Étienne" },
];

const ligue1Matches: MatchData[] = [
  { round: 1, homeTeam: "Le Havre", awayTeam: "Paris Saint-Germain", homeScore: 1, awayScore: 4, date: new Date("2024-08-16") },
  { round: 1, homeTeam: "Stade Brestois", awayTeam: "Marseille", homeScore: 1, awayScore: 1, date: new Date("2024-08-17") },
  { round: 1, homeTeam: "Reims", awayTeam: "Lille", homeScore: 1, awayScore: 1, date: new Date("2024-08-17") },
  { round: 1, homeTeam: "Lyon", awayTeam: "Strasbourg", homeScore: 4, awayScore: 1, date: new Date("2024-08-17") },
  { round: 1, homeTeam: "Nantes", awayTeam: "Auxerre", homeScore: 0, awayScore: 2, date: new Date("2024-08-17") },
  { round: 2, homeTeam: "Monaco", awayTeam: "Lens", homeScore: 2, awayScore: 1, date: new Date("2024-08-23") },
  { round: 2, homeTeam: "Paris Saint-Germain", awayTeam: "Montpellier", homeScore: 6, awayScore: 0, date: new Date("2024-08-24") },
  { round: 2, homeTeam: "Marseille", awayTeam: "Reims", homeScore: 2, awayScore: 0, date: new Date("2024-08-24") },
  { round: 3, homeTeam: "Lille", awayTeam: "Paris Saint-Germain", homeScore: 3, awayScore: 1, date: new Date("2024-08-31") },
  { round: 3, homeTeam: "Lyon", awayTeam: "Strasbourg", homeScore: 2, awayScore: 0, date: new Date("2024-08-31") },
];

const laLigaTeams: TeamData[] = [
  { name: "Real Madrid", city: "Madrid" },
  { name: "Barcelona", city: "Barcelona" },
  { name: "Atlético Madrid", city: "Madrid" },
  { name: "Athletic Bilbao", city: "Bilbao" },
  { name: "Villarreal", city: "Villarreal" },
  { name: "Real Betis", city: "Sevilla" },
  { name: "Real Sociedad", city: "San Sebastián" },
  { name: "Osasuna", city: "Pamplona" },
  { name: "Valencia", city: "Valencia" },
  { name: "Valladolid", city: "Valladolid" },
];

const laLigaMatches: MatchData[] = [
  { round: 1, homeTeam: "Athletic Bilbao", awayTeam: "Real Betis", homeScore: 1, awayScore: 1, date: new Date("2024-08-15") },
  { round: 1, homeTeam: "Valencia", awayTeam: "Barcelona", homeScore: 1, awayScore: 2, date: new Date("2024-08-17") },
  { round: 2, homeTeam: "Barcelona", awayTeam: "Athletic Bilbao", homeScore: 2, awayScore: 1, date: new Date("2024-08-24") },
  { round: 2, homeTeam: "Real Madrid", awayTeam: "Valladolid", homeScore: 3, awayScore: 0, date: new Date("2024-08-25") },
];

const premierLeagueTeams: TeamData[] = [
  { name: "Arsenal", city: "London" },
  { name: "Liverpool", city: "Liverpool" },
  { name: "Manchester City", city: "Manchester" },
  { name: "Manchester United", city: "Manchester" },
  { name: "Chelsea", city: "London" },
  { name: "Tottenham", city: "London" },
  { name: "Newcastle", city: "Newcastle" },
  { name: "Brighton", city: "Brighton" },
];

const premierLeagueMatches: MatchData[] = [
  { round: 1, homeTeam: "Manchester United", awayTeam: "Brighton", homeScore: 1, awayScore: 0, date: new Date("2024-08-16") },
  { round: 1, homeTeam: "Arsenal", awayTeam: "Newcastle", homeScore: 2, awayScore: 0, date: new Date("2024-08-17") },
  { round: 2, homeTeam: "Liverpool", awayTeam: "Chelsea", homeScore: 2, awayScore: 0, date: new Date("2024-08-25") },
  { round: 2, homeTeam: "Manchester City", awayTeam: "Tottenham", homeScore: 4, awayScore: 1, date: new Date("2024-08-24") },
];

type TournamentStatus = "draft" | "registration" | "in_progress" | "completed" | "cancelled";

interface TournamentConfig {
  name: string;
  description: string;
  status: TournamentStatus;
  date: Date;
  teams: TeamData[];
  matches: MatchData[];
}

async function seed() {
  console.log("Starting database seeding...");

  // Clean up existing data (in reverse order of dependencies)
  console.log("Cleaning up existing data...");
  await db.delete(tournamentSubscriptions);
  await db.delete(matches);
  await db.delete(teams);
  await db.delete(tournaments);
  await db.delete(users);
  console.log("Cleanup complete.");

  // Tournaments with different statuses
  const tournamentConfigs: TournamentConfig[] = [
    {
      name: "Ligue 1 McDonald's",
      description: "Championnat de France de football - Saison 2024-2025",
      status: "in_progress",
      date: new Date("2024-08-15"),
      teams: ligue1Teams,
      matches: ligue1Matches,
    },
    {
      name: "LaLiga EA Sports",
      description: "Championnat d'Espagne de football - Saison 2024-2025",
      status: "completed",
      date: new Date("2024-05-01"),
      teams: laLigaTeams,
      matches: laLigaMatches,
    },
    {
      name: "Premier League",
      description: "Championnat d'Angleterre de football - Saison 2024-2025",
      status: "in_progress",
      date: new Date("2024-08-17"),
      teams: premierLeagueTeams,
      matches: premierLeagueMatches,
    },
    {
      name: "Tournoi de Noël 2024",
      description: "Tournoi amical de baby-foot pour les fêtes",
      status: "draft",
      date: new Date("2024-12-20"),
      teams: [],
      matches: [],
    },
    {
      name: "Coupe de Printemps",
      description: "Inscriptions ouvertes ! Venez participer au tournoi de printemps",
      status: "registration",
      date: new Date("2025-03-15"),
      teams: [
        { name: "Les Champions", city: "Paris" },
        { name: "FC Winners", city: "Lyon" },
        { name: "Dream Team", city: "Marseille" },
      ],
      matches: [],
    },
    {
      name: "Tournoi Annulé 2024",
      description: "Ce tournoi a été annulé en raison de circonstances imprévues",
      status: "cancelled",
      date: new Date("2024-06-01"),
      teams: [],
      matches: [],
    },
  ];

  for (const config of tournamentConfigs) {
    console.log(`Creating tournament: ${config.name} (${config.status})`);

    const tournamentId = generateId();

    await db.insert(tournaments).values({
      id: tournamentId,
      name: config.name,
      description: config.description,
      date: config.date,
      status: config.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const teamIdMap: Record<string, string> = {};

    for (const team of config.teams) {
      const teamId = generateId();
      teamIdMap[team.name] = teamId;

      await db.insert(teams).values({
        id: teamId,
        name: team.name,
        tournamentId: tournamentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (config.teams.length > 0) {
      console.log(`  ${config.teams.length} teams created`);
    }

    let matchNumber = 0;
    for (const match of config.matches) {
      matchNumber++;
      const matchId = generateId();
      const homeTeamId = teamIdMap[match.homeTeam];
      const awayTeamId = teamIdMap[match.awayTeam];

      if (!homeTeamId || !awayTeamId) {
        console.warn(`  Team not found for match: ${match.homeTeam} vs ${match.awayTeam}`);
        continue;
      }

      await db.insert(matches).values({
        id: matchId,
        tournamentId: tournamentId,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: "completed",
        round: match.round,
        matchNumber: matchNumber,
        scheduledAt: match.date,
        playedAt: match.date,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (config.matches.length > 0) {
      console.log(`  ${config.matches.length} matches created`);
    }
  }

  console.log("Creating users...");

  const allUsers = [...adminUsers, ...viewerUsers];
  const userIdMap: Record<string, string> = {};

  for (const userData of allUsers) {
    const userId = generateId();
    userIdMap[userData.email] = userId;
    const password = userData.role === "admin" ? SEED_ADMIN_PASSWORD : SEED_USER_PASSWORD;
    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    await db.insert(users).values({
      id: userId,
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log(`  ${adminUsers.length} admin users created`);
  console.log(`  ${viewerUsers.length} viewer users created`);

  console.log("Creating subscriptions...");

  const allTournaments = await db.select({ id: tournaments.id, name: tournaments.name }).from(tournaments);

  let subscriptionCount = 0;

  for (const admin of adminUsers) {
    const userId = userIdMap[admin.email];
    for (const tournament of allTournaments) {
      await db.insert(tournamentSubscriptions).values({
        id: generateId(),
        userId: userId,
        tournamentId: tournament.id,
        notifyOnMatch: true,
        notifyOnResult: true,
        createdAt: new Date(),
      });
      subscriptionCount++;
    }
  }

  for (let i = 0; i < viewerUsers.length; i++) {
    const user = viewerUsers[i];
    const userId = userIdMap[user.email];

    const tournamentIndices: number[] = [];
    tournamentIndices.push(i % allTournaments.length);
    tournamentIndices.push((i + 2) % allTournaments.length);

    if (i % 2 === 0) {
      tournamentIndices.push((i + 4) % allTournaments.length);
    }

    const uniqueIndices = [...new Set(tournamentIndices)];

    for (const idx of uniqueIndices) {
      const tournament = allTournaments[idx];
      await db.insert(tournamentSubscriptions).values({
        id: generateId(),
        userId: userId,
        tournamentId: tournament.id,
        notifyOnMatch: i % 2 === 0,
        notifyOnResult: true,
        createdAt: new Date(),
      });
      subscriptionCount++;
    }
  }

  console.log(`  ${subscriptionCount} total subscriptions created`);
  console.log("Database seeding completed successfully!");
}

seed()
  .then(() => {
    console.log("Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });
