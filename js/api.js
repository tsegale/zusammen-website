/* ============================================================
   ZUSAMMEN TOURS — API CLIENT
   Connects the frontend to the Express backend.
   Exposes window.WPAPI so main.js and page scripts can use it.
   ============================================================ */

const API_BASE = 'http://localhost:3000/api';
window.API_BASE = API_BASE;

/* ── fetchTours ──────────────────────────────────────────── */
async function fetchTours() {
  try {
    const res = await fetch(API_BASE + '/tours');
    if (!res.ok) throw new Error('API ' + res.status);
    const tours = await res.json();
    console.log('✅ Tours from API:', tours.length, 'loaded');
    return tours;
  } catch (err) {
    console.warn('⚠️ fetchTours failed - using fallback:', err.message);
    return null;
  }
}

/* ── fetchBlogs ──────────────────────────────────────────── */
async function fetchBlogs() {
  try {
    const res = await fetch(API_BASE + '/blogs');
    if (!res.ok) throw new Error('API ' + res.status);
    const blogs = await res.json();
    return blogs.map(b => ({
      id:        b.id,
      title:     b.title,
      tag:       b.tag      || 'Travel',
      excerpt:   b.excerpt  || '',
      content:   b.content  || '',
      img:       b.image_url || '',
      date:      b.published_at
                   ? new Date(b.published_at).toLocaleDateString(
                       'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                   : '',
      author:    b.author   || 'Zusammen Tours',
      readTime:  b.read_time || '5 min read',
      detailUrl: 'pages/blog-detail.html?id=' + b.id,
    }));
  } catch (err) {
    console.warn('⚠️ fetchBlogs failed - using fallback:', err.message);
    return null;
  }
}

/* ── fetchFAQs ───────────────────────────────────────────── */
async function fetchFAQs() {
  try {
    const res = await fetch(API_BASE + '/faqs');
    if (!res.ok) throw new Error('API ' + res.status);
    const faqs = await res.json();
    return faqs.map(f => ({ q: f.question, a: f.answer }));
  } catch (err) {
    console.warn('⚠️ fetchFAQs failed - using fallback:', err.message);
    return null;
  }
}

/* ── submitEnquiry ───────────────────────────────────────── */
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
      email:      fd.get('email')       || '',
      phone:      fd.get('phone')       || '',
      tour_name:  tourName              || fd.get('tour') || '',
      travel_from: fd.get('travelFrom') || '',
      travel_to:   fd.get('travelTo')   || '',
      adults:      Number(fd.get('adults'))   || 1,
      children:    Number(fd.get('children')) || 0,
      message:     fd.get('message')    || '',
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
console.log('window.WPAPI set:', !!window.WPAPI);
