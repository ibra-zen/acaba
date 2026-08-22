import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Veritabanı dosya yolu
const dbPath = path.resolve(process.cwd(), process.env.DB_PATH || 'database.sqlite');

// Singleton veritabanı örneği
let db: SqlJsDatabase;

/**
 * sql.js veritabanını başlatır. Dosya varsa diskten okur, yoksa yeni oluşturur.
 */
export async function getDb(): Promise<SqlJsDatabase> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  return db;
}

/**
 * Değişiklikleri diske yazar. Her yazma işleminden sonra çağrılmalıdır.
 */
export function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

/**
 * Veritabanı tablolarını oluşturan SQL şeması
 */
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    device_id TEXT UNIQUE,
    current_language TEXT DEFAULT 'tr',
    premium_status TEXT DEFAULT 'free',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'editor',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_tr TEXT,
    name_en TEXT,
    name_de TEXT,
    name_fr TEXT,
    name_es TEXT,
    name_zh TEXT,
    name_ru TEXT,
    icon TEXT,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_type TEXT,
    difficulty TEXT,
    category_id INTEGER,
    status TEXT DEFAULT 'draft',
    priority INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS question_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    language_code TEXT,
    question_text TEXT,
    explanation TEXT,
    wrong_answer_message TEXT,
    status TEXT DEFAULT 'pending',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS question_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    language_code TEXT,
    option_key TEXT,
    option_text TEXT,
    is_correct INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS question_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    version INTEGER,
    changed_by TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_data TEXT,
    new_data TEXT
  );

  CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    game_mode TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    question_id INTEGER,
    user_answer TEXT,
    is_correct INTEGER,
    answer_time_ms INTEGER,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_statistics (
    user_id TEXT PRIMARY KEY,
    total_played INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    highest_streak INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    highest_timed_score INTEGER DEFAULT 0,
    weakest_category TEXT,
    strongest_category TEXT,
    daily_streak INTEGER DEFAULT 0,
    last_played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_play_time_seconds INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    icon TEXT,
    name_tr TEXT,
    name_en TEXT,
    description_tr TEXT,
    description_en TEXT,
    condition_type TEXT,
    condition_value INTEGER
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
    user_id TEXT,
    achievement_id INTEGER,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
  );

  CREATE TABLE IF NOT EXISTS daily_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_date TEXT UNIQUE,
    question_ids TEXT
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    user_id TEXT,
    rating_type TEXT,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id TEXT,
    action TEXT,
    target_type TEXT,
    target_id TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * Tabloları oluşturur ve diske kaydeder.
 */
export async function initDb(): Promise<void> {
  const database = await getDb();
  database.run(SCHEMA);
  saveDb();
  console.log('✅ Veritabanı tabloları başarıyla oluşturuldu.');
}

/**
 * sql.js sorgu sonucunu nesne dizisine çevirir.
 */
export function queryAll(sql: string, params: any[] = []): Record<string, any>[] {
  if (!db) throw new Error('Veritabanı henüz başlatılmadı.');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: Record<string, any>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * sql.js ile tek satır döndürür.
 */
export function queryOne(sql: string, params: any[] = []): Record<string, any> | undefined {
  const rows = queryAll(sql, params);
  return rows[0];
}

/**
 * sql.js ile yazma işlemi yapar (INSERT/UPDATE/DELETE).
 */
export function run(sql: string, params: any[] = []): void {
  if (!db) throw new Error('Veritabanı henüz başlatılmadı.');
  db.run(sql, params);
  saveDb();
}
