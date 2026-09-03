// Admin dashboard: login/session handling, drag-and-drop multi-upload
// with progress, and gallery management (view / search / delete).

const ADMIN_PAGE_SIZE = 24;

let selectedFiles = [];
let adminPage = 1;
let adminTotalPages = 1;
let adminPhotos = [];

document.addEventListener("DOMContentLoaded", () => {
  checkSession();
  setupLoginForm();
  setupLogout();
  setupDropzone();
  setupUploadForm();
  setupSearch();
});

// ---------- Session / login ----------

async function checkSession() {
  try {
    const res = await fetch("/api/admin/session");
    const data = await res.json();
    if (data.loggedIn) {
      showDashboard(data.email);
    } else {
      showLogin();
    }
  } catch {
    showLogin();
  }
}

function showLogin() {
  document.getElementById("loginView").style.display = "flex";
  document.getElementById("dashboardView").style.display = "none";
}

function showDashboard(email) {
  document.getElementById("loginView").style.display = "none";
  document.getElementById("dashboardView").style.display = "block";
  document.getElementById("adminEmailLabel").textContent = email || "Signed in";
  loadAdminGallery(1);
}

function setupLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageBox = document.getElementById("loginMessage");
    messageBox.className = "form-message";
    messageBox.textContent = "";

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed.");

      showDashboard(data.email);
    } catch (err) {
      messageBox.className = "form-message error";
      messageBox.textContent = err.message || "Login failed.";
    }
  });
}

function setupLogout() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    showLogin();
  });
}

// ---------- Upload: dropzone + preview ----------

function setupDropzone() {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    addFiles(Array.from(fileInput.files));
    fileInput.value = "";
  });

  ["dragenter", "dragover"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
    });
  });

  dropzone.addEventListener("drop", (e) => {
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    addFiles(files);
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    selectedFiles = [];
    renderPreviewGrid();
  });
}

function addFiles(files) {
  const MAX = 40;
  selectedFiles = [...selectedFiles, ...files].slice(0, MAX);
  renderPreviewGrid();
}

function renderPreviewGrid() {
  const grid = document.getElementById("previewGrid");
  const uploadBtn = document.getElementById("uploadBtn");
  const clearBtn = document.getElementById("clearBtn");

  grid.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const tile = document.createElement("div");
    tile.className = "preview-tile";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    tile.appendChild(img);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.innerHTML = "&times;";
    removeBtn.addEventListener("click", () => {
      selectedFiles.splice(index, 1);
      renderPreviewGrid();
    });
    tile.appendChild(removeBtn);

    grid.appendChild(tile);
  });

  uploadBtn.disabled = selectedFiles.length === 0;
  clearBtn.style.display = selectedFiles.length > 0 ? "inline-flex" : "none";
}

// ---------- Upload: submit with progress ----------

function setupUploadForm() {
  const form = document.getElementById("uploadForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;
    uploadFiles();
  });
}

function uploadFiles() {
  const formData = new FormData();
  selectedFiles.forEach((file) => formData.append("photos", file));

  const progressWrap = document.getElementById("progressWrap");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const uploadBtn = document.getElementById("uploadBtn");

  progressWrap.classList.add("active");
  progressFill.style.width = "0%";
  progressText.textContent = `Uploading 0 of ${selectedFiles.length}…`;
  uploadBtn.disabled = true;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/gallery/upload");

  xhr.upload.addEventListener("progress", (e) => {
    if (!e.lengthComputable) return;
    const percent = Math.round((e.loaded / e.total) * 100);
    progressFill.style.width = percent + "%";
    progressText.textContent = `Uploading… ${percent}%`;
  });

  xhr.onload = () => {
    progressWrap.classList.remove("active");
    uploadBtn.disabled = false;

    let data;
    try {
      data = JSON.parse(xhr.responseText);
    } catch {
      data = null;
    }

    if (xhr.status >= 200 && xhr.status < 300 && data) {
      showToast(`Uploaded ${data.saved.length} photo${data.saved.length === 1 ? "" : "s"}.`);
      if (data.failed && data.failed.length > 0) {
        showToast(`${data.failed.length} file(s) could not be processed.`, true);
      }
      selectedFiles = [];
      renderPreviewGrid();
      loadAdminGallery(1);
    } else {
      showToast((data && data.error) || "Upload failed.", true);
    }
  };

  xhr.onerror = () => {
    progressWrap.classList.remove("active");
    uploadBtn.disabled = false;
    showToast("Upload failed. Check your connection and try again.", true);
  };

  xhr.send(formData);
}

// ---------- Existing gallery: list / search / delete ----------

async function loadAdminGallery(page) {
  const grid = document.getElementById("adminGalleryGrid");
  const emptyState = document.getElementById("adminGalleryEmpty");

  try {
    const res = await fetch(`/api/gallery?page=${page}&limit=${ADMIN_PAGE_SIZE}`);
    const data = await res.json();

    adminPage = data.page;
    adminTotalPages = data.totalPages;
    adminPhotos = data.photos;

    document.getElementById("statTotal").textContent = data.total;
    document.getElementById("statPages").textContent = data.totalPages;
    document.getElementById("statLatest").textContent =
      data.photos[0] ? formatShortDate(data.photos[0].uploadDate) : "—";

    renderAdminGrid(adminPhotos);
    renderAdminPagination();
  } catch (err) {
    console.error("Failed to load gallery:", err);
    showToast("Could not load gallery.", true);
  }
}

function renderAdminGrid(photos) {
  const grid = document.getElementById("adminGalleryGrid");
  const emptyState = document.getElementById("adminGalleryEmpty");

  if (photos.length === 0) {
    grid.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  grid.innerHTML = photos
    .map(
      (photo) => `
      <div class="admin-photo-tile" data-id="${photo.id}">
        <img src="${photo.thumbnailUrl}" alt="${escapeHtml(photo.originalFilename)}" loading="lazy" />
        <div class="overlay"><span>${escapeHtml(photo.originalFilename)}</span></div>
        <button class="delete-btn" data-id="${photo.id}" aria-label="Delete photo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`
    )
    .join("");

  grid.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      deletePhoto(parseInt(btn.dataset.id, 10));
    });
  });
}

function renderAdminPagination() {
  const wrap = document.getElementById("adminPagination");
  wrap.innerHTML = "";
  if (adminTotalPages <= 1) return;

  const makeBtn = (label, page, opts = {}) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    if (opts.active) btn.classList.add("active");
    if (opts.disabled) btn.disabled = true;
    btn.addEventListener("click", () => loadAdminGallery(page));
    return btn;
  };

  wrap.appendChild(makeBtn("‹", adminPage - 1, { disabled: adminPage === 1 }));
  for (let p = 1; p <= adminTotalPages; p++) {
    if (Math.abs(p - adminPage) <= 2 || p === 1 || p === adminTotalPages) {
      wrap.appendChild(makeBtn(String(p), p, { active: p === adminPage }));
    }
  }
  wrap.appendChild(makeBtn("›", adminPage + 1, { disabled: adminPage === adminTotalPages }));
}

async function deletePhoto(id) {
  if (!confirm("Delete this photo? This cannot be undone.")) return;

  try {
    const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Delete failed.");

    showToast("Photo deleted.");
    loadAdminGallery(adminPage);
  } catch (err) {
    showToast(err.message || "Delete failed.", true);
  }
}

function setupSearch() {
  const input = document.getElementById("adminSearch");
  if (!input) return;

  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    if (!term) {
      renderAdminGrid(adminPhotos);
      return;
    }
    const filtered = adminPhotos.filter((p) =>
      (p.originalFilename || "").toLowerCase().includes(term)
    );
    renderAdminGrid(filtered);
  });
}

// ---------- Helpers ----------

function showToast(text, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.className = "toast show" + (isError ? " error" : "");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

function formatShortDate(str) {
  if (!str) return "—";
  const date = new Date(str.replace(" ", "T") + "Z");
  if (isNaN(date)) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}
