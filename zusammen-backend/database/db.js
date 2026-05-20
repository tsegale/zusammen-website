const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const dbPath = path.resolve(
  process.env.DATABASE_URL || "./database/zusammen.db"
);

let _sqlDb = null;
let _inTransaction = false;

function saveDb() {
  if (!_sqlDb || _inTransaction) return;
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const data = _sqlDb.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

/* ── STATEMENT WRAPPER (better-sqlite3-compatible API) ────────── */
class Stmt {
  constructor(sql) {
    this._sql = sql;
  }

  _prepareBinding(args) {
    if (args.length === 0) return [];
    if (args.length === 1) {
      const v = args[0];
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        // Named params object: { title: "..." } → { "@title": "..." }
        const bound = {};
        for (const [k, val] of Object.entries(v)) {
          const key =
            k.startsWith("@") || k.startsWith(":") || k.startsWith("$")
              ? k
              : "@" + k;
          bound[key] = val;
        }
        return bound;
      }
      return [v]; // single positional value
    }
    return args; // multiple positional values
  }

  _exec(params) {
    const stmt = _sqlDb.prepare(this._sql);
    const binding = this._prepareBinding(params);
    if (
      (Array.isArray(binding) && binding.length > 0) ||
      (!Array.isArray(binding) && Object.keys(binding).length > 0)
    ) {
      stmt.bind(binding);
    }
    return stmt;
  }

  get(...args) {
    const stmt = this._exec(args);
    let row;
    if (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    return row;
  }

  all(...args) {
    const stmt = this._exec(args);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  run(...args) {
    const stmt = this._exec(args);
    stmt.step();
    stmt.free();

    const changes = _sqlDb.getRowsModified();
    const res = _sqlDb.exec("SELECT last_insert_rowid()");
    const lastInsertRowid = res[0]?.values[0]?.[0] ?? 0;

    saveDb();
    return { lastInsertRowid, changes };
  }
}

/* ── DB WRAPPER ───────────────────────────────────────────────── */
class DbWrapper {
  pragma(str) {
    try {
      _sqlDb.run(`PRAGMA ${str}`);
    } catch (_) {
      // ignore unsupported pragmas (e.g. WAL in WASM context)
    }
    return this;
  }

  exec(sql) {
    _sqlDb.exec(sql); // sql.js exec handles multi-statement
    saveDb();
    return this;
  }

  prepare(sql) {
    return new Stmt(sql);
  }

  transaction(fn) {
    return (...args) => {
      _sqlDb.run("BEGIN TRANSACTION");
      _inTransaction = true;
      try {
        const result = fn(...args);
        _sqlDb.run("COMMIT");
        _inTransaction = false;
        saveDb();
        return result;
      } catch (err) {
        _sqlDb.run("ROLLBACK");
        _inTransaction = false;
        throw err;
      }
    };
  }
}

/* ── INIT ─────────────────────────────────────────────────────── */
async function initDb() {
  const initSqlJs = require("sql.js");
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    _sqlDb = new SQL.Database(buf);
  } else {
    _sqlDb = new SQL.Database();
  }

  // Create tables
  _sqlDb.exec(`
    CREATE TABLE IF NOT EXISTS tours (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      title          TEXT    NOT NULL,
      slug           TEXT    UNIQUE NOT NULL,
      location       TEXT    NOT NULL,
      category       TEXT    NOT NULL,
      rating         INTEGER DEFAULT 5,
      reviews        INTEGER DEFAULT 0,
      price          REAL    NOT NULL,
      old_price      REAL,
      days           INTEGER NOT NULL,
      nights         INTEGER NOT NULL,
      guests         INTEGER DEFAULT 12,
      min_age        INTEGER DEFAULT 0,
      min_people     INTEGER DEFAULT 2,
      max_people     INTEGER DEFAULT 12,
      description    TEXT,
      destinations   TEXT,
      includes       TEXT    DEFAULT '[]',
      excludes       TEXT    DEFAULT '[]',
      highlights     TEXT    DEFAULT '[]',
      available_dates TEXT,
      image_url      TEXT,
      active         INTEGER DEFAULT 1,
      created_at     TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      title        TEXT    NOT NULL,
      slug         TEXT    UNIQUE NOT NULL,
      tag          TEXT,
      excerpt      TEXT,
      content      TEXT,
      image_url    TEXT,
      author       TEXT    DEFAULT 'Zusammen Tours',
      read_time    TEXT,
      published_at TEXT    DEFAULT (datetime('now')),
      active       INTEGER DEFAULT 1,
      created_at   TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      question   TEXT    NOT NULL,
      answer     TEXT    NOT NULL,
      sort_order INTEGER DEFAULT 0,
      active     INTEGER DEFAULT 1,
      created_at TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      tour_id     INTEGER,
      tour_name   TEXT,
      first_name  TEXT    NOT NULL,
      last_name   TEXT    NOT NULL,
      email       TEXT    NOT NULL,
      phone       TEXT,
      travel_from TEXT,
      travel_to   TEXT,
      adults      INTEGER DEFAULT 1,
      children    INTEGER DEFAULT 0,
      message     TEXT,
      status      TEXT    DEFAULT 'new',
      created_at  TEXT    DEFAULT (datetime('now'))
    );
  `);

  saveDb();

  const _wrapper = new DbWrapper();
  return _wrapper;
}

/* ── PROXY (routes import this directly; init() must run first) ─ */
const _wrapper = new DbWrapper();

const db = new Proxy(
  { initDb },
  {
    get(target, key) {
      if (key in target) return target[key];
      if (!_sqlDb)
        throw new Error("Database not initialised — call db.initDb() first.");
      const val = _wrapper[key];
      return typeof val === "function" ? val.bind(_wrapper) : val;
    },
  }
);

module.exports = db;
