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

/* ── IMAGE INPUT COMPONENT ─────────────────────────────────────── */

function makeImageInput(containerId, hiddenInputId, initialValue = "") {
  const container = document.getElementById(containerId);
  if (!container) return;
  const uid = hiddenInputId;
  container.innerHTML = `
    <input type="hidden" id="${uid}" value="">
    <div class="img-input-wrap">
      <div class="img-tabs">
        <button type="button" class="img-tab active" onclick="imgSwitchTab('${uid}','url',this)">🔗 Paste URL</button>
        <button type="button" class="img-tab" onclick="imgSwitchTab('${uid}','path',this)">📂 Path</button>
        <button type="button" class="img-tab" onclick="imgSwitchTab('${uid}','upload',this)">📁 Upload</button>
      </div>
      <div class="img-tab-content">
        <div class="img-tab-panel active" id="${uid}-panel-url">
          <input type="text" placeholder="https://... or paste image URL" id="${uid}-url-in"
            oninput="imgSetValue('${uid}', this.value)">
        </div>
        <div class="img-tab-panel" id="${uid}-panel-path">
          <input type="text" placeholder="assets/gallery/image.jpg" id="${uid}-path-in"
            oninput="imgSetValuePath('${uid}', this.value)">
          <p class="form-hint" style="margin-top:4px">Relative path from frontend root</p>
        </div>
        <div class="img-tab-panel" id="${uid}-panel-upload">
          <input type="file" accept="image/*" id="${uid}-file-in"
            onchange="imgUploadFile('${uid}', this)">
          <p class="form-hint" style="margin-top:4px">Max 10 MB · JPG, PNG, WebP, GIF</p>
        </div>
        <div class="img-preview">
          <img id="${uid}-img-prev" src="" alt="Preview" style="display:none">
          <span id="${uid}-no-prev" style="color:#aaa;font-size:13px">No image selected</span>
        </div>
      </div>
    </div>`;
  if (initialValue) {
    const urlIn = document.getElementById(uid + "-url-in");
    if (urlIn) urlIn.value = initialValue;
    imgSetValue(uid, initialValue);
  }
}

function imgSwitchTab(uid, tab, btnEl) {
  const wrap = btnEl.closest(".img-input-wrap");
  if (!wrap) return;
  wrap.querySelectorAll(".img-tab").forEach((t) => t.classList.remove("active"));
  wrap.querySelectorAll(".img-tab-panel").forEach((p) => p.classList.remove("active"));
  btnEl.classList.add("active");
  const panel = document.getElementById(uid + "-panel-" + tab);
  if (panel) panel.classList.add("active");
}

function imgSetValue(uid, value) {
  const hidden = document.getElementById(uid);
  if (hidden) hidden.value = value;
  const prev = document.getElementById(uid + "-img-prev");
  const noPrev = document.getElementById(uid + "-no-prev");
  if (!prev) return;
  if (value) {
    prev.src = value;
    prev.style.display = "";
    if (noPrev) noPrev.style.display = "none";
    prev.onerror = function () {
      this.style.display = "none";
      if (noPrev) noPrev.style.display = "";
    };
  } else {
    prev.src = "";
    prev.style.display = "none";
    if (noPrev) noPrev.style.display = "";
  }
}

function imgSetValuePath(uid, value) {
  const hidden = document.getElementById(uid);
  if (hidden) hidden.value = value;
  const previewSrc = value
    ? value.startsWith("http") || value.startsWith("/")
      ? value
      : "../" + value
    : "";
  const prev = document.getElementById(uid + "-img-prev");
  const noPrev = document.getElementById(uid + "-no-prev");
  if (!prev) return;
  if (previewSrc) {
    prev.src = previewSrc;
    prev.style.display = "";
    if (noPrev) noPrev.style.display = "none";
    prev.onerror = function () {
      this.style.display = "none";
      if (noPrev) noPrev.style.display = "";
    };
  } else {
    prev.src = "";
    prev.style.display = "none";
    if (noPrev) noPrev.style.display = "";
  }
}

async function imgUploadFile(uid, fileInput) {
  if (!fileInput.files || !fileInput.files[0]) return;
  const formData = new FormData();
  formData.append("image", fileInput.files[0]);
  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload failed");
    imgSetValue(uid, data.url);
    showToast("Image uploaded", "success");
  } catch (err) {
    showToast("Upload failed: " + err.message, "error");
  }
}

/* ── INIT ──────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", initSidebar);
