import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";
import {
	CREATE_SETTINGS_TABLE,
	rowToSettings,
	type Settings,
	type SettingsInput,
} from "./schema";

/** Database file path */
const DB_PATH =
	process.env.DOUGH_DB_PATH || join(process.cwd(), "data", "dough.db");

/** Singleton database instance */
let db: Database.Database | null = null;

/** Get or create the database connection */
function getDb(): Database.Database {
	if (db) return db;

	// Ensure the data directory exists
	const dir = dirname(DB_PATH);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	db = new Database(DB_PATH);
	db.pragma("journal_mode = WAL");

	// Run migrations
	db.exec(CREATE_SETTINGS_TABLE);

	return db;
}

/** Get current settings (returns null if not configured) */
export function getSettings(): Settings | null {
	const db = getDb();
	const row = db.prepare("SELECT * FROM settings WHERE id = 1").get() as
		| Record<string, unknown>
		| undefined;

	if (!row) return null;
	return rowToSettings(row);
}

/** Save settings (creates or updates) */
export function saveSettings(input: SettingsInput): Settings {
	const db = getDb();

	const existing = getSettings();

	if (existing) {
		// Update existing settings
		db.prepare(
			`
      UPDATE settings SET
        node_url = ?,
        dal_node_url = ?,
        baker_address = ?,
        baker_alias = ?,
        updated_at = datetime('now')
      WHERE id = 1
    `,
		).run(
			input.nodeUrl,
			input.dalNodeUrl ?? null,
			input.bakerAddress,
			input.bakerAlias ?? null,
		);
	} else {
		// Insert new settings
		db.prepare(
			`
      INSERT INTO settings (id, node_url, dal_node_url, baker_address, baker_alias)
      VALUES (1, ?, ?, ?, ?)
    `,
		).run(
			input.nodeUrl,
			input.dalNodeUrl ?? null,
			input.bakerAddress,
			input.bakerAlias ?? null,
		);
	}

	// We just inserted/updated, so this will always return a value
	const result = getSettings();
	if (!result) {
		throw new Error("Failed to save settings");
	}
	return result;
}

/** Check if the app is configured */
export function isConfigured(): boolean {
	return getSettings() !== null;
}

/** Close the database connection */
export function closeDb(): void {
	if (db) {
		db.close();
		db = null;
	}
}

// Re-export types
export type { Settings, SettingsInput } from "./schema";
