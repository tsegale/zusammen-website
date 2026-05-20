# Zusammen Tours — REST API Backend

Node.js + Express + SQLite backend for Zusammen Tours and Travel Agency.

---

## Prerequisites

- Node.js 18 or later (tested on v24)
- npm 9 or later
- No C++ compiler or build tools required — uses `sql.js` (pure WebAssembly SQLite)

---

## Setup

### 1. Install dependencies

```bash
cd zusammen-backend
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your real values:

```bash
cp .env.example .env
```

Open `.env` and set:

| Variable        | Description                                        |
|-----------------|----------------------------------------------------|
| `PORT`          | Port the server listens on (default: 3000)         |
| `DATABASE_URL`  | Path to the SQLite database file                   |
| `CONTACT_EMAIL` | Email address that receives enquiry notifications  |
| `SMTP_HOST`     | SMTP server host (e.g. `smtp.gmail.com`)           |
| `SMTP_PORT`     | SMTP port (587 for TLS, 465 for SSL)               |
| `SMTP_USER`     | Your Gmail (or other SMTP) address                 |
| `SMTP_PASS`     | Gmail App Password (not your account password)     |
| `FRONTEND_URL`  | Allowed CORS origin for local dev                  |
| `ADMIN_KEY`     | Secret key for admin-only routes                   |

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail" and paste it as `SMTP_PASS`.

### 3. Seed the database

```bash
npm run seed
```

This creates `database/zusammen.db` and inserts 6 tours, 6 blogs and 10 FAQs.

### 4. Start the server

Development (auto-restart on file changes):
```bash
npm run dev
```

Production:
```bash
npm start
```

The API will be available at `http://localhost:3000`.

---

## API Reference

### Health

| Method | Endpoint       | Description          |
|--------|----------------|----------------------|
| GET    | `/api/health`  | Server health check  |

```json
{ "status": "ok", "timestamp": "2026-05-20T10:00:00.000Z" }
```

---

### Tours

| Method | Endpoint          | Auth    | Description              |
|--------|-------------------|---------|--------------------------|
| GET    | `/api/tours`      | Public  | All active tours         |
| GET    | `/api/tours/:id`  | Public  | Single tour              |
| POST   | `/api/tours`      | Admin   | Create tour              |
| PUT    | `/api/tours/:id`  | Admin   | Update tour              |
| DELETE | `/api/tours/:id`  | Admin   | Soft-delete tour         |

**Query parameters (GET /api/tours):**
- `category` — filter by category (e.g. `Luxury Safaris`)
- `location` — filter by country (e.g. `Namibia`)
- `q` — search title, description or location

**Example response (GET /api/tours):**
```json
{
  "count": 6,
  "data": [
    {
      "id": 1,
      "title": "Namibia Desert & Etosha Safari",
      "slug": "namibia-desert-etosha-safari",
      "location": "Namibia",
      "category": "Luxury Safaris",
      "price": 85000,
      "old_price": 95000,
      "days": 8,
      "nights": 7,
      "includes": ["Professional guide", "Luxury lodge accommodation", "..."],
      "excludes": ["International flights", "..."],
      "highlights": ["Sossusvlei red dunes at sunrise", "..."],
      "active": true
    }
  ]
}
```

---

### Blogs

| Method | Endpoint          | Auth    | Description              |
|--------|-------------------|---------|--------------------------|
| GET    | `/api/blogs`      | Public  | All active blogs (paged) |
| GET    | `/api/blogs/:id`  | Public  | Single blog              |
| POST   | `/api/blogs`      | Admin   | Create blog              |
| PUT    | `/api/blogs/:id`  | Admin   | Update blog              |
| DELETE | `/api/blogs/:id`  | Admin   | Soft-delete blog         |

**Query parameters (GET /api/blogs):**
- `page` — page number (default: 1)
- `limit` — items per page (default: 10, max: 50)
- `tag` — filter by tag (e.g. `Travel Tips`)

---

### FAQs

| Method | Endpoint         | Auth    | Description               |
|--------|------------------|---------|---------------------------|
| GET    | `/api/faqs`      | Public  | All active FAQs (ordered) |
| POST   | `/api/faqs`      | Admin   | Create FAQ                |
| PUT    | `/api/faqs/:id`  | Admin   | Update FAQ                |
| DELETE | `/api/faqs/:id`  | Admin   | Soft-delete FAQ           |

---

### Enquiries

| Method | Endpoint                      | Auth    | Description               |
|--------|-------------------------------|---------|---------------------------|
| POST   | `/api/enquiries`              | Public  | Submit enquiry (+ email)  |
| GET    | `/api/enquiries`              | Admin   | List all enquiries        |
| PUT    | `/api/enquiries/:id/status`   | Admin   | Update enquiry status     |

**POST /api/enquiries body:**
```json
{
  "tour_id": 1,
  "tour_name": "Namibia Desert & Etosha Safari",
  "first_name": "James",
  "last_name": "Smith",
  "email": "james@example.com",
  "phone": "+264 81 123 4567",
  "travel_from": "2026-07-10",
  "travel_to": "2026-07-18",
  "adults": 2,
  "children": 1,
  "message": "We'd love a private guide."
}
```

**Enquiry status values:** `new` | `in_progress` | `responded` | `closed`

---

### Admin Authentication

Add the `x-admin-key` header to all admin requests:

```
x-admin-key: zusammen-admin-secret-key-2026
```

---

## Pricing Notes

- All prices are in **NAD (Namibian Dollars)**
- Children aged **3–12** travel at **60% of the adult rate**
- Children **under 3** travel free (subject to lodge policy)
- Children **13+** are charged the full adult rate

---

## Project Structure

```
zusammen-backend/
├── server.js          — Express app entry point
├── .env               — Environment variables (not committed)
├── .env.example       — Template for .env
├── package.json
├── database/
│   ├── db.js          — SQLite connection + table creation
│   └── seed.js        — Initial data population
└── routes/
    ├── tours.js       — Tour CRUD
    ├── blogs.js       — Blog CRUD
    ├── faqs.js        — FAQ CRUD
    └── enquiries.js   — Enquiry submission + email
```

---

## Re-seeding

To reset and re-seed all data:

```bash
npm run seed
```

> This clears all existing tours, blogs and FAQs before re-inserting. Enquiries are also cleared.
