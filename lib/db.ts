import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(path.join(process.cwd(), "bondvault.db"));
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      email_verified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      password_hash TEXT,
      access_token TEXT,
      refresh_token TEXT,
      expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bonds (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      denomination TEXT NOT NULL,
      bond_number TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
      UNIQUE(user_id, denomination, bond_number)
    );

    CREATE TABLE IF NOT EXISTS draws (
      id TEXT PRIMARY KEY,
      denomination TEXT NOT NULL,
      draw_date TEXT NOT NULL,
      draw_number TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS winning_numbers (
      id TEXT PRIMARY KEY,
      draw_id TEXT NOT NULL,
      bond_number TEXT NOT NULL,
      prize_type TEXT NOT NULL,
      prize_amount TEXT NOT NULL,
      FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      bond_id TEXT NOT NULL,
      winning_number_id TEXT NOT NULL,
      matched_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
      FOREIGN KEY (bond_id) REFERENCES bonds(id) ON DELETE CASCADE,
      FOREIGN KEY (winning_number_id) REFERENCES winning_numbers(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON session(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON session(token);
    CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON account(user_id);
    CREATE INDEX IF NOT EXISTS idx_bonds_user_id ON bonds(user_id);
    CREATE INDEX IF NOT EXISTS idx_bonds_user_denomination ON bonds(user_id, denomination);
    CREATE INDEX IF NOT EXISTS idx_draws_denomination ON draws(denomination);
    CREATE INDEX IF NOT EXISTS idx_winning_draw_id ON winning_numbers(draw_id);
    CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
  `);
}
