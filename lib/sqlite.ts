import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

// Database instance
let db: SqlJsDatabase | null = null;
const dbPath = path.join(process.cwd(), 'data', 'tokens.db');

// Initialize the database
export async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('✅ Loaded existing SQLite database from:', dbPath);
  } else {
    db = new SQL.Database();
    console.log('✅ Created new SQLite database at:', dbPath);
  }
  
  // Create the tokens table
  db.run(`
    CREATE TABLE IF NOT EXISTS tokens (
      address TEXT PRIMARY KEY,
      symbol TEXT,
      launch_date TEXT,
      category TEXT,
      ath REAL,
      ath_last24hrs REAL,
      name TEXT,
      description TEXT,
      image_uri TEXT,
      twitter TEXT,
      website TEXT,
      telegram TEXT,
      metadata_json TEXT,
      enriched INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Create indexes for faster queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_launch_date ON tokens(launch_date);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_enriched ON tokens(enriched);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_category ON tokens(category);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbol ON tokens(symbol);`);
  
  console.log('✅ SQLite database initialized');
  
  return db;
}

// Save database to disk
export function saveDatabase() {
  if (!db) throw new Error('Database not initialized');
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Get database instance
export function getDb(): SqlJsDatabase {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

export interface TokenRow {
  address: string;
  symbol: string | null;
  launch_date: string;
  category: string | null;
  ath: number | null;
  ath_last24hrs: number | null;
  name: string | null;
  description: string | null;
  image_uri: string | null;
  twitter: string | null;
  website: string | null;
  telegram: string | null;
  metadata_json: string | null;
  enriched: number;
  created_at?: string;
  updated_at?: string;
}

// Helper functions
export function insertToken(token: {
  address: string;
  symbol: string | null;
  launch_date: string;
  category: string | null;
  ath: number | null;
  ath_last24hrs: number | null;
}) {
  const database = getDb();
  database.run(
    `INSERT OR REPLACE INTO tokens (address, symbol, launch_date, category, ath, ath_last24hrs) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [token.address, token.symbol, token.launch_date, token.category, token.ath, token.ath_last24hrs]
  );
}

export function insertTokensBatch(tokens: Array<{
  address: string;
  symbol: string | null;
  launch_date: string;
  category: string | null;
  ath: number | null;
  ath_last24hrs: number | null;
}>) {
  const database = getDb();
  
  // Begin transaction for batch insert
  database.run('BEGIN TRANSACTION');
  
  try {
    for (const token of tokens) {
      database.run(
        `INSERT OR REPLACE INTO tokens (address, symbol, launch_date, category, ath, ath_last24hrs) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [token.address, token.symbol, token.launch_date, token.category, token.ath, token.ath_last24hrs]
      );
    }
    database.run('COMMIT');
  } catch (error) {
    database.run('ROLLBACK');
    throw error;
  }
}

export function updateMetadata(
  address: string,
  metadata: {
    name: string | null;
    symbol: string | null;
    description: string | null;
    image_uri: string | null;
    twitter: string | null;
    website: string | null;
    telegram: string | null;
    metadata_json: string | null;
  }
) {
  const database = getDb();
  database.run(
    `UPDATE tokens SET
      name = ?,
      symbol = ?,
      description = ?,
      image_uri = ?,
      twitter = ?,
      website = ?,
      telegram = ?,
      metadata_json = ?,
      enriched = 1,
      updated_at = CURRENT_TIMESTAMP
    WHERE address = ?`,
    [
      metadata.name,
      metadata.symbol,
      metadata.description,
      metadata.image_uri,
      metadata.twitter,
      metadata.website,
      metadata.telegram,
      metadata.metadata_json,
      address
    ]
  );
}

export function getUnenrichedTokens(limit: number, offset: number = 0): TokenRow[] {
  const database = getDb();
  const result = database.exec(
    `SELECT address, symbol, launch_date FROM tokens WHERE enriched = 0 ORDER BY launch_date ASC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  
  if (result.length === 0) return [];
  
  const rows = result[0];
  return rows.values.map(row => ({
    address: row[0] as string,
    symbol: row[1] as string | null,
    launch_date: row[2] as string,
    category: null,
    ath: null,
    ath_last24hrs: null,
    name: null,
    description: null,
    image_uri: null,
    twitter: null,
    website: null,
    telegram: null,
    metadata_json: null,
    enriched: 0
  }));
}

// Wrapper function that takes positional arguments (for worker scripts)
// Converts undefined to null for SQLite compatibility
export function updateTokenMetadata(
  address: string,
  name: string | null | undefined,
  symbol: string | null | undefined,
  image: string | null | undefined,
  description: string | null | undefined,
  twitter: string | null | undefined,
  website: string | null | undefined,
  telegram: string | null | undefined
): void {
  updateMetadata(address, {
    name: name ?? null,
    symbol: symbol ?? null,
    description: description ?? null,
    image_uri: image ?? null,
    twitter: twitter ?? null,
    website: website ?? null,
    telegram: telegram ?? null,
    metadata_json: null
  });
}

export function getTokenByAddress(address: string): TokenRow | null {
  const database = getDb();
  const result = database.exec(`SELECT * FROM tokens WHERE address = ?`, [address]);
  
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const row = result[0].values[0];
  const columns = result[0].columns;
  
  const token: any = {};
  columns.forEach((col, idx) => {
    token[col] = row[idx];
  });
  
  return token as TokenRow;
}

export function getAllTokens(limit: number, offset: number): TokenRow[] {
  const database = getDb();
  const result = database.exec(
    `SELECT * FROM tokens ORDER BY launch_date DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  
  if (result.length === 0) return [];
  
  const rows = result[0];
  return rows.values.map(row => {
    const token: any = {};
    rows.columns.forEach((col, idx) => {
      token[col] = row[idx];
    });
    return token as TokenRow;
  });
}

export function getStats() {
  const database = getDb();
  
  const totalResult = database.exec(`SELECT COUNT(*) as count FROM tokens`);
  const enrichedResult = database.exec(`SELECT COUNT(*) as count FROM tokens WHERE enriched = 1`);
  
  const total = totalResult[0]?.values[0]?.[0] as number || 0;
  const enriched = enrichedResult[0]?.values[0]?.[0] as number || 0;
  
  return {
    total,
    enriched,
    remaining: total - enriched,
    progress: total > 0 ? ((enriched / total) * 100).toFixed(2) : '0.00'
  };
}

export async function getTokenCount(): Promise<number> {
  const database = getDb();
  const result = database.exec(`SELECT COUNT(*) as count FROM tokens`);
  return (result[0]?.values[0]?.[0] as number) || 0;
}

export async function getEnrichedTokenCount(): Promise<number> {
  const database = getDb();
  const result = database.exec(`SELECT COUNT(*) as count FROM tokens WHERE enriched = 1`);
  return (result[0]?.values[0]?.[0] as number) || 0;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}
