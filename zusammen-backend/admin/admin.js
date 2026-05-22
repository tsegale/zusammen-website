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

function createImageInput({ containerId, inputId, initialValue = "" }) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <input type="hidden" id="${inputId}" value="">
    <div class="img-input-wrap" data-iid="${inputId}">
      <div class="img-tabs">
        <button type="button" class="img-tab active" onclick="switchImgTab('${inputId}','upload',this)">Upload from Computer</button>
        <button type="button" class="img-tab" onclick="switchImgTab('${inputId}','url',this)">Paste URL</button>
      </div>
      <div class="img-tab-content">
        <div class="img-tab-panel active" id="${inputId}-panel-upload">
          <label class="img-upload-label">
            <input type="file" accept="image/*" style="display:none" onchange="handleFileUpload('${inputId}',this)">
            <span class="img-upload-btn">Choose File</span>
            <span class="img-upload-hint">JPG, PNG, WebP, GIF &middot; max 10 MB</span>
          </label>
          <div class="img-progress-wrap" id="${inputId}-progress-wrap" style="display:none">
            <div class="img-progress" id="${inputId}-progress"></div>
          </div>
        </div>
        <div class="img-tab-panel" id="${inputId}-panel-url">
          <input type="text" placeholder="https://example.com/image.jpg" id="${inputId}-url-in"
            oninput="handleUrlInput('${inputId}', this.value)">
        </div>
        <div class="img-preview-row" id="${inputId}-preview-row" style="display:none">
          <img id="${inputId}-preview-img" src="" alt="Preview">
          <button type="button" class="img-clear-btn" onclick="clearImageValue('${inputId}')">&#10005; Remove</button>
        </div>
        <p class="img-no-preview" id="${inputId}-no-preview">No image selected</p>
      </div>
    </div>`;
  if (initialValue) {
    setImageValue(inputId, initialValue);
    const urlIn = document.getElementById(inputId + "-url-in");
    if (urlIn) {
      urlIn.value = initialValue;
      const urlTab = container.querySelector(".img-tab:last-child");
      if (urlTab) switchImgTab(inputId, "url", urlTab);
    }
  }
}

function switchImgTab(inputId, tab, btnEl) {
  const wrap = btnEl.closest(".img-input-wrap");
  if (!wrap) return;
  wrap.querySelectorAll(".img-tab").forEach((t) => t.classList.remove("active"));
  wrap.querySelectorAll(".img-tab-panel").forEach((p) => p.classList.remove("active"));
  btnEl.classList.add("active");
  const panel = document.getElementById(inputId + "-panel-" + tab);
  if (panel) panel.classList.add("active");
}

function setImageValue(inputId, value) {
  const hidden = document.getElementById(inputId);
  if (hidden) hidden.value = value || "";
  const prevRow = document.getElementById(inputId + "-preview-row");
  const noPreview = document.getElementById(inputId + "-no-preview");
  const img = document.getElementById(inputId + "-preview-img");
  if (!img) return;
  if (value) {
    img.src = value;
    img.onerror = function () { this.style.display = "none"; };
    img.style.display = "";
    if (prevRow) prevRow.style.display = "";
    if (noPreview) noPreview.style.display = "none";
  } else {
    img.src = "";
    img.style.display = "";
    if (prevRow) prevRow.style.display = "none";
    if (noPreview) noPreview.style.display = "";
  }
}

function clearImageValue(inputId) {
  setImageValue(inputId, "");
  const urlIn = document.getElementById(inputId + "-url-in");
  if (urlIn) urlIn.value = "";
  const wrap = document.querySelector(`[data-iid="${inputId}"]`);
  if (wrap) {
    const fileIn = wrap.querySelector("input[type=file]");
    if (fileIn) fileIn.value = "";
  }
}

function getImageValue(inputId) {
  const hidden = document.getElementById(inputId);
  return hidden ? hidden.value.trim() : "";
}

async function handleFileUpload(inputId, fileInput) {
  if (!fileInput.files || !fileInput.files[0]) return;
  const progressWrap = document.getElementById(inputId + "-progress-wrap");
  const progress     = document.getElementById(inputId + "-progress");
  if (progressWrap) progressWrap.style.display = "";
  if (progress) { progress.style.transition = "none"; progress.style.width = "0%"; }

  let pct = 0;
  const ticker = setInterval(() => {
    pct = Math.min(pct + 12, 85);
    if (progress) { progress.style.transition = "width .15s"; progress.style.width = pct + "%"; }
  }, 150);

  const formData = new FormData();
  formData.append("image", fileInput.files[0]);
  try {
    const res  = await fetch("/api/upload", { method: "POST", credentials: "include", body: formData });
    const data = await res.json().catch(() => ({}));
    clearInterval(ticker);
    if (!res.ok) throw new Error(data.error || "Upload failed");
    if (progress) progress.style.width = "100%";
    setTimeout(() => { if (progressWrap) progressWrap.style.display = "none"; }, 500);
    setImageValue(inputId, data.url);
    showToast("Image uploaded", "success");
  } catch (err) {
    clearInterval(ticker);
    if (progressWrap) progressWrap.style.display = "none";
    showToast("Upload failed: " + err.message, "error");
  }
}

function handleUrlInput(inputId, value) {
  setImageValue(inputId, value.trim());
}

/* ── GALLERY COMPONENT ─────────────────────────────────────────── */

let _galleryImages = [];
let _galleryContainerId = "";

function initGallery(containerId, initialImages = []) {
  _galleryContainerId = containerId;
  _galleryImages = Array.isArray(initialImages) ? initialImages.filter(Boolean) : [];
  renderGallery();
}

function renderGallery() {
  const container = document.getElementById(_galleryContainerId);
  if (!container) return;
  if (!_galleryImages.length) {
    container.innerHTML = `<p class="gallery-empty">No gallery images yet</p>`;
    return;
  }
  container.innerHTML = _galleryImages.map((url, i) => `
    <div class="gallery-item">
      <img src="${url}" alt="Gallery ${i + 1}" onerror="this.style.display='none'">
      <div class="gallery-item-footer">
        <span class="gallery-item-url" title="${url}">${url.length > 48 ? url.slice(0, 48) + "…" : url}</span>
        <button type="button" class="gallery-item-remove" onclick="removeGalleryImage(${i})">&#10005;</button>
      </div>
    </div>`).join("");
}

function removeGalleryImage(index) {
  _galleryImages.splice(index, 1);
  renderGallery();
}

function addGalleryFromUrl(url) {
  url = (url || "").trim();
  if (!url) { showToast("Please enter an image URL", "error"); return; }
  if (_galleryImages.includes(url)) { showToast("Image already in gallery", "info"); return; }
  _galleryImages.push(url);
  renderGallery();
}

async function addGalleryFromFile(fileInput) {
  if (!fileInput.files || !fileInput.files[0]) return;
  const formData = new FormData();
  formData.append("image", fileInput.files[0]);
  try {
    const res  = await fetch("/api/upload", { method: "POST", credentials: "include", body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload failed");
    _galleryImages.push(data.url);
    renderGallery();
    fileInput.value = "";
    showToast("Image added to gallery", "success");
  } catch (err) {
    showToast("Upload failed: " + err.message, "error");
  }
}

function getGalleryImages() {
  return [..._galleryImages];
}

/* ── DELETE HELPER ─────────────────────────────────────────────── */

async function confirmDelete(label, url, onSuccess) {
  if (!confirm(`Permanently delete this ${label}?\n\nThis cannot be undone.`)) return;
  try {
    await apiFetch(url, { method: "DELETE" });
    showToast(`${label.charAt(0).toUpperCase() + label.slice(1)} deleted`, "success");
    if (typeof onSuccess === "function") onSuccess();
  } catch (err) {
    showToast("Delete failed: " + err.message, "error");
  }
}

/* ── INIT ──────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", initSidebar);
