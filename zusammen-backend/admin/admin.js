/* ================================================================
   ZUSAMMEN ADMIN — SHARED UTILITIES
   ================================================================ */
"use strict";

/* ── AUTH ──────────────────────────────────────────────────────── */
async function checkAuth() {
  try {
    const res = await fetch("/api/admin/check", { credentials: "include" });
    const data = await res.json();
    if (!data.authenticated) {
      window.location.href = "/admin/login.html";
      return false;
    }
    return true;
  } catch {
    window.location.href = "/admin/login.html";
    return false;
  }
}

async function logout() {
  try {
    await fetch("/api/admin/logout", { credentials: "include" });
  } catch {}
  window.location.href = "/admin/login.html";
}

/* ── API FETCH ─────────────────────────────────────────────────── */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/* ── TOASTS ────────────────────────────────────────────────────── */
function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const icons = { success: "✓", error: "✕", info: "i" };
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span style="font-weight:800">${icons[type] || "•"}</span><span>${message}</span>`;
  container.appendChild(t);
  t.addEventListener("click", () => t.remove());
  setTimeout(() => { t.style.opacity = "0"; t.style.transition = "opacity .3s"; setTimeout(() => t.remove(), 300); }, 3500);
}

/* ── FORMATTERS ────────────────────────────────────────────────── */
function formatDate(str) {
  if (!str) return "—";
  try {
    const d = new Date(str);
    return isNaN(d) ? str : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return str; }
}

function formatPrice(n) {
  if (n == null || n === "") return "—";
  return "N$" + Number(n).toLocaleString("en-ZA");
}

function getStatusBadge(status) {
  const map = {
    new:          ["badge-new",         "New"],
    "in-progress":["badge-in-progress", "In Progress"],
    in_progress:  ["badge-in-progress", "In Progress"],
    replied:      ["badge-replied",     "Replied"],
    responded:    ["badge-replied",     "Responded"],
    closed:       ["badge-closed",      "Closed"],
  };
  const [cls, label] = map[status] || ["badge-closed", status || "Unknown"];
  return `<span class="badge ${cls}">${label}</span>`;
}

function getActiveBadge(active) {
  return active
    ? `<span class="badge badge-active">Active</span>`
    : `<span class="badge badge-inactive">Inactive</span>`;
}

/* ── SIDEBAR (mobile) ──────────────────────────────────────────── */
function initSidebar() {
  const hamburger = document.getElementById("hamburger");
  const sidebar   = document.getElementById("sidebar");
  if (!hamburger || !sidebar) return;

  // overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = "display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99;";
  document.body.appendChild(overlay);

  hamburger.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    overlay.style.display = open ? "block" : "none";
  });
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.style.display = "none";
  });
}

/* ── PANEL HELPERS ─────────────────────────────────────────────── */
function openPanel(overlayId, panelId) {
  document.getElementById(overlayId)?.classList.add("open");
  document.getElementById(panelId)?.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closePanel(overlayId, panelId) {
  document.getElementById(overlayId)?.classList.remove("open");
  document.getElementById(panelId)?.classList.remove("open");
  document.body.style.overflow = "";
}
function openModal(overlayId) {
  document.getElementById(overlayId)?.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(overlayId) {
  document.getElementById(overlayId)?.classList.remove("open");
  document.body.style.overflow = "";
}

/* ── INIT ──────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", initSidebar);
