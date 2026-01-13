/** Settings stored in the database */
export interface Settings {
	id: number;
	/** Octez Node RPC URL */
	nodeUrl: string;
	/** DAL Node RPC URL (optional) */
	dalNodeUrl: string | null;
	/** Baker/Delegate address */
	bakerAddress: string;
	/** Baker alias for display */
	bakerAlias: string | null;
	/** When the settings were created */
	createdAt: string;
	/** When the settings were last updated */
	updatedAt: string;
}

/** Input for creating/updating settings */
export interface SettingsInput {
	nodeUrl: string;
	dalNodeUrl?: string | null;
	bakerAddress: string;
	bakerAlias?: string | null;
}

/** SQL to create the settings table */
export const CREATE_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  node_url TEXT NOT NULL,
  dal_node_url TEXT,
  baker_address TEXT NOT NULL,
  baker_alias TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)
`;

/** Map database row to Settings object */
export function rowToSettings(row: Record<string, unknown>): Settings {
	return {
		id: row.id as number,
		nodeUrl: row.node_url as string,
		dalNodeUrl: row.dal_node_url as string | null,
		bakerAddress: row.baker_address as string,
		bakerAlias: row.baker_alias as string | null,
		createdAt: row.created_at as string,
		updatedAt: row.updated_at as string,
	};
}
