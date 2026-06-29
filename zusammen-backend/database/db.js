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
  // const initSqlJs = require("sql.js");
  const initSqlJs = require("sql.js/dist/sql-asm.js");
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
      gallery_images TEXT    DEFAULT '[]',
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

  // Migrate existing databases
  try {
    _sqlDb.exec("ALTER TABLE tours ADD COLUMN gallery_images TEXT DEFAULT '[]'");
  } catch (_) {
    // Column already exists — ignore
  }

  // Add extended tour fields
  const extraColumns = [
    "ALTER TABLE tours ADD COLUMN activities TEXT DEFAULT '[]'",
    "ALTER TABLE tours ADD COLUMN itinerary TEXT DEFAULT '[]'",
    "ALTER TABLE tours ADD COLUMN introduction TEXT DEFAULT ''",
    "ALTER TABLE tours ADD COLUMN pickup_address TEXT DEFAULT ''",
    "ALTER TABLE tours ADD COLUMN dropoff_address TEXT DEFAULT ''",
    "ALTER TABLE tours ADD COLUMN city TEXT DEFAULT ''",
    "ALTER TABLE tours ADD COLUMN region TEXT DEFAULT ''",
    "ALTER TABLE tours ADD COLUMN zip TEXT DEFAULT ''",
    "ALTER TABLE tours ADD COLUMN country TEXT DEFAULT ''"
  ];
  extraColumns.forEach(sql => {
    try { _sqlDb.exec(sql); } catch(e) { /* column exists */ }
  });

  // One-time seed: Namibia Desert Dunes Safari (id=9)
  try {
    const _namibiaCheck = new Stmt("SELECT introduction FROM tours WHERE id = 9").get();
    if (_namibiaCheck !== undefined && !_namibiaCheck.introduction) {
      const _namibiaItinerary = [
        { day: 1, heading: "Day 1 – Arrival in Windhoek", content: "Arrive at Hosea Kutako International Airport, where you will be warmly welcomed and transferred to The Olive Exclusive, a boutique sanctuary nestled in the heart of Windhoek. Enjoy an afternoon at leisure, relaxing after your flight or exploring the city’s craft markets and colonial architecture. This evening, savour a gourmet dinner overlooking the tranquil olive grove." },
        { day: 2, heading: "Day 2 – Into the Namib Desert", content: "After breakfast, take a scenic flight over rugged landscapes en route to the Namib Desert. Upon arrival, you’ll be transferred to andBeyond Sossusvlei Desert Lodge, an oasis of refinement set amidst ancient dunes and rocky outcrops. This afternoon, join a guided drive to experience the desert’s grandeur or unwind at the lodge, taking in the silence and vastness of the landscape." },
        { day: 3, heading: "Day 3 – Dunes and Desert Wonders", content: "Rise early for a mesmerising excursion to the iconic red dunes of Sossusvlei. Watch the morning light paint the sand in shades of gold and crimson before visiting the hauntingly beautiful Deadvlei. Return to the lodge for a leisurely afternoon, with optional activities such as quad biking, guided nature walks, or stargazing through the lodge’s state-of-the-art observatory." },
        { day: 4, heading: "Day 4 – Flight to Damaraland", content: "Depart by air for Damaraland, where dramatic mountain ranges, dry riverbeds, and ancient valleys define the landscape. On arrival, settle into Damaraland Camp, renowned for its community partnership and spectacular vistas. This afternoon, take a guided nature drive in search of desert-adapted elephants and other remarkable wildlife that thrive in this arid environment." },
        { day: 5, heading: "Day 5 – Discovering Damaraland", content: "Spend the day uncovering the geological and cultural treasures of Damaraland. Visit Twyfelfontein, a UNESCO World Heritage Site celebrated for its ancient rock engravings, or enjoy a guided hike through the rolling hills. Return to camp for sundowners, followed by dinner beneath a sky ablaze with stars." },
        { day: 6, heading: "Day 6 – To the Skeleton Coast", content: "Fly northwards over ever-changing terrain to the legendary Skeleton Coast. Your destination, Hoanib Skeleton Coast Camp, lies at the confluence of haunting desert and remote coastline. This afternoon, enjoy an introductory game drive through the Hoanib River valley, where lions and oryx roam among ghostly dunes." },
        { day: 7, heading: "Day 7 – Skeleton Coast Adventure", content: "Spend the day exploring this starkly beautiful region. Depending on the weather, take a full-day excursion to the Atlantic coast, including a scenic drive through dune fields, a picnic lunch by the ocean, and sightings of Cape fur seals. Return to camp for a sumptuous dinner and stories shared by the fire." },
        { day: 8, heading: "Day 8 – Wilderness and Wildlife", content: "Enjoy another day of discovery, tracking desert-adapted wildlife or visiting the research centre to learn about ongoing conservation projects. For a more relaxed pace, spend the day at leisure, soaking in the serene desert views." },
        { day: 9, heading: "Day 9 – Return to Windhoek", content: "Bid farewell to the wilderness as you fly back to Windhoek. Upon arrival, check into The Hilton Hotel, where modern luxury awaits. Enjoy a final evening of comfort, fine dining, and reflection on your extraordinary journey through Namibia’s wild heart." },
        { day: 10, heading: "Day 10 – Departure", content: "After breakfast, transfer from your hotel to Hosea Kutako International Airport. Take with you lasting memories of crimson dunes, desert elephants, and the soulful silence that defines Namibia’s timeless landscapes." }
      ];
      const _namibiaActivities = [
        "Windhoek craft markets and colonial architecture",
        "Scenic flight over Namib Desert",
        "Red dunes of Sossusvlei",
        "Deadvlei salt pan",
        "Quad biking, nature walks, stargazing",
        "Desert-adapted elephants in Damaraland",
        "Twyfelfontein UNESCO rock engravings",
        "Hoanib River valley wildlife",
        "Atlantic coast and Cape fur seals",
        "Desert wildlife tracking and conservation",
        "Sunset/sundowners and stargazing experiences"
      ];
      new Stmt(`UPDATE tours SET
        introduction = @introduction, itinerary = @itinerary,
        activities = @activities, pickup_address = @pickup_address,
        dropoff_address = @dropoff_address, city = @city,
        region = @region, zip = @zip, country = @country
        WHERE id = 9`).run({
        introduction: "Set out on an unforgettable fly-in safari through the heart of Namibia; a land of striking contrasts, sculpted dunes, and vast untamed wilderness. This exclusive journey blends effortless luxury with the thrill of discovery, carrying you between some of the country’s most breathtaking regions by light aircraft.",
        itinerary:       JSON.stringify(_namibiaItinerary),
        activities:      JSON.stringify(_namibiaActivities),
        pickup_address:  "Hosea Kutako International Airport",
        dropoff_address: "Hosea Kutako International Airport",
        city: "Windhoek", region: "Khomas", zip: "10005", country: "Namibia"
      });
    }
  } catch(e) {
    console.error("Namibia seed error:", e.message);
  }

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
