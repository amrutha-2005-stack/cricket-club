// Public gallery page: fetches one page of photos at a time from
// GET /api/gallery?page=N&limit=40, renders a lazy-loaded grid, and
// powers a full-screen lightbox with prev/next navigation.

const GALLERY_PAGE_SIZE = 40;

let currentPage = 1;
let totalPages = 1;
let currentPhotos = [];
let lightboxIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  loadPage(1);
  setupLightbox();
});

async function loadPage(page) {
  const grid = document.getElementById("galleryGrid");
  const emptyState = document.getElementById("galleryEmpty");
  const countLabel = document.getElementById("galleryCount");

  countLabel.textContent = "Loading photos…";
  grid.innerHTML = "";
  emptyState.style.display = "none";

  try {
    const res = await fetch(`/api/gallery?page=${page}&limit=${GALLERY_PAGE_SIZE}`);
    const data = await res.json();

    currentPage = data.page;
    totalPages = data.totalPages;
    currentPhotos = data.photos;

    if (data.total === 0) {
      countLabel.textContent = "0 photos";
      emptyState.style.display = "block";
      renderPagination();
      return;
    }

    countLabel.textContent = `Showing ${data.photos.length} of ${data.total} photos — page ${data.page} of ${data.totalPages}`;

    grid.innerHTML = currentPhotos
      .map(
        (photo, i) => `
        <div class="photo-tile" data-index="${i}">
          <img src="${photo.thumbnailUrl}" alt="Bengaluru Friends Cricket Club photo" loading="lazy" onload="this.classList.add('loaded')" />
        </div>`
      )
      .join("");

    grid.querySelectorAll(".photo-tile").forEach((tile) => {
      tile.addEventListener("click", () => {
        openLightbox(parseInt(tile.dataset.index, 10));
      });
    });

    renderPagination();
    window.scrollTo({ top: grid.offsetTop - 100, behavior: "smooth" });
  } catch (err) {
    console.error("Failed to load gallery:", err);
    countLabel.textContent = "Could not load photos. Please refresh the page.";
  }
}

function renderPagination() {
  const wrap = document.getElementById("pagination");
  wrap.innerHTML = "";

  if (totalPages <= 1) return;

  const makeBtn = (label, page, opts = {}) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    if (opts.active) btn.classList.add("active");
    if (opts.disabled) btn.disabled = true;
    btn.addEventListener("click", () => loadPage(page));
    return btn;
  };

  wrap.appendChild(makeBtn("‹ Prev", currentPage - 1, { disabled: currentPage === 1 }));

  const windowSize = 2;
  for (let p = 1; p <= totalPages; p++) {
    const withinWindow = Math.abs(p - currentPage) <= windowSize;
    const isEdge = p === 1 || p === totalPages;
    if (withinWindow || isEdge) {
      wrap.appendChild(makeBtn(String(p), p, { active: p === currentPage }));
    } else if (p === currentPage - windowSize - 1 || p === currentPage + windowSize + 1) {
      const dots = document.createElement("span");
      dots.textContent = "…";
      dots.style.padding = "0 6px";
      dots.style.color = "var(--text-muted-light)";
      wrap.appendChild(dots);
    }
  }

  wrap.appendChild(makeBtn("Next ›", currentPage + 1, { disabled: currentPage === totalPages }));
}

// ---------- Lightbox ----------

function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => stepLightbox(-1));
  nextBtn.addEventListener("click", () => stepLightbox(1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  });
}

function openLightbox(index) {
  lightboxIndex = index;
  renderLightbox();
  document.getElementById("lightbox").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
  document.body.style.overflow = "";
}

async function stepLightbox(direction) {
  const nextIndex = lightboxIndex + direction;

  if (nextIndex < 0) {
    if (currentPage > 1) {
      await loadPage(currentPage - 1);
      lightboxIndex = currentPhotos.length - 1;
      renderLightbox();
    }
    return;
  }

  if (nextIndex >= currentPhotos.length) {
    if (currentPage < totalPages) {
      await loadPage(currentPage + 1);
      lightboxIndex = 0;
      renderLightbox();
    }
    return;
  }

  lightboxIndex = nextIndex;
  renderLightbox();
}

function renderLightbox() {
  const photo = currentPhotos[lightboxIndex];
  if (!photo) return;

  document.getElementById("lightboxImg").src = photo.url;
  document.getElementById("lightboxImg").alt = photo.originalFilename || "Gallery photo";

  const date = photo.uploadDate ? new Date(photo.uploadDate.replace(" ", "T") + "Z") : null;
  const dateLabel = date && !isNaN(date) ? date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";

  document.getElementById("lightboxMeta").textContent =
    `Photo ${lightboxIndex + 1} of ${currentPhotos.length} on this page${dateLabel ? " · Uploaded " + dateLabel : ""}`;
}
