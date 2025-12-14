/**
 * Team entity (internal API use with Date objects)
 */
export interface Team {
  id: string;
  name: string;
  tournamentId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Team as returned by API (JSON serialized - dates are strings)
 */
export interface TeamResponse {
  id: string;
  name: string;
  tournamentId: string;
  createdAt: string;
  updatedAt: string;
}
