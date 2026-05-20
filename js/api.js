/* ============================================================
   ZUSAMMEN TOURS — API CLIENT
   Connects the frontend to the Express backend.
   Exposes window.WPAPI so main.js works unchanged.
   ============================================================ */

const API_BASE = 'http://localhost:3000/api';

/* ── helpers ─────────────────────────────────────────────── */
function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function mapTour(t) {
  return {
    id:             t.id,
    title:          t.title,
    location:       t.location,
    category:       t.category,
    rating:         t.rating,
    reviews:        t.reviews,
    price:          t.price,
    oldPrice:       t.old_price ?? null,
    days:           t.days,
    nights:         t.nights,
    guests:         t.guests,
    minAge:         t.min_age ?? 6,
    minPeople:      t.min_people ?? 2,
    maxPeople:      t.max_people ?? 12,
    img:            t.image_url  || '',
    description:    t.description || '',
    destinations:   t.destinations || '',
    includes:       Array.isArray(t.includes)   ? t.includes   : JSON.parse(t.includes   || '[]'),
    excludes:       Array.isArray(t.excludes)   ? t.excludes   : JSON.parse(t.excludes   || '[]'),
    highlights:     Array.isArray(t.highlights) ? t.highlights : JSON.parse(t.highlights || '[]'),
    availableDates: t.available_dates || '',
  };
}

function mapBlog(b, idx) {
  return {
    id:        b.id,
    title:     b.title,
    tag:       b.tag       || '',
    excerpt:   b.excerpt   || '',
    content:   b.content   || '',
    img:       b.image_url || '',
    date:      formatDate(b.published_at),
    author:    b.author    || 'Zusammen Tours',
    readTime:  b.read_time || '5 min read',
    detailUrl: `pages/blog-detail.html?id=${b.id}`,
  };
}

/* ── API functions ───────────────────────────────────────── */
async function fetchTours() {
  try {
    const res = await fetch(`${API_BASE}/tours`);
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data || []).map(mapTour);
  } catch (err) {
    console.warn('[api] fetchTours failed:', err.message);
    return null;
  }
}

async function fetchBlogs(limit = 6) {
  try {
    const res = await fetch(`${API_BASE}/blogs?limit=${limit}`);
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data || []).map(mapBlog);
  } catch (err) {
    console.warn('[api] fetchBlogs failed:', err.message);
    return null;
  }
}

async function fetchFAQs() {
  try {
    const res = await fetch(`${API_BASE}/faqs`);
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data || []).map(f => ({ q: f.question, a: f.answer }));
  } catch (err) {
    console.warn('[api] fetchFAQs failed:', err.message);
    return null;
  }
}

async function submitEnquiry(formEl, tourName) {
  try {
    const fd = new FormData(formEl);

    const fullName = (fd.get('name') || '').trim();
    const spaceIdx = fullName.indexOf(' ');
    const first_name = spaceIdx > -1 ? fullName.slice(0, spaceIdx) : fullName;
    const last_name  = spaceIdx > -1 ? fullName.slice(spaceIdx + 1).trim() : '';

    const body = {
      first_name: first_name || 'Guest',
      last_name:  last_name  || '—',
      email:      fd.get('email')      || '',
      phone:      fd.get('phone')      || '',
      tour_name:  tourName             || fd.get('tour') || '',
      travel_from: fd.get('travelFrom') || '',
      travel_to:   fd.get('travelTo')   || '',
      adults:      Number(fd.get('adults'))   || 1,
      children:    Number(fd.get('children')) || 0,
      message:     fd.get('message')   || '',
    };

    const res = await fetch(`${API_BASE}/enquiries`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error || 'Submission failed' };
    return { success: true, id: json.id };
  } catch (err) {
    console.error('[api] submitEnquiry failed:', err.message);
    return { success: false, error: err.message };
  }
}

/* ── skeleton loader ─────────────────────────────────────── */
function showSkeletons(id, count) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = Array(count).fill(`
    <div style="background:#f0f4f8;border-radius:12px;
      overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
      <div style="height:185px;background:
        linear-gradient(90deg,#e8edf2 25%,#d8dfe8 50%,
        #e8edf2 75%);background-size:200% 100%;
        animation:shimmer 1.5s infinite"></div>
      <div style="padding:16px;display:flex;
        flex-direction:column;gap:8px">
        <div style="height:12px;background:#e8edf2;
          border-radius:6px;animation:shimmer 1.5s infinite">
        </div>
        <div style="height:16px;background:#e8edf2;
          border-radius:6px;width:75%;
          animation:shimmer 1.5s infinite"></div>
        <div style="height:12px;background:#e8edf2;
          border-radius:6px;width:50%;
          animation:shimmer 1.5s infinite"></div>
      </div>
    </div>`).join('');
  if (!document.getElementById('shimmer-kf')) {
    const s = document.createElement('style');
    s.id = 'shimmer-kf';
    s.textContent = '@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}';
    document.head.appendChild(s);
  }
}

/* ── export ──────────────────────────────────────────────── */
window.WPAPI = {
  fetchTours,
  fetchBlogs,
  fetchFAQs,
  submitEnquiry,
  showSkeletons,
};

console.log('✅ api.js loaded — Zusammen Tours backend connected');
