// Shared behaviour used across the public pages: nav scroll state,
// mobile menu toggle, scroll-reveal animation, homepage gallery preview,
// and the contact form submission.

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initReveal();
  initContactForm();
  loadGalleryPreview();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

function initNavbar() {
  const navbar = document.getElementById("navbar");
  const navLinks = document.getElementById("navLinks");
  const navToggle = document.getElementById("navToggle");

  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 40) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => navLinks.classList.remove("open"));
    });
  }
}

function initReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

async function loadGalleryPreview() {
  const grid = document.getElementById("galleryPreviewGrid");
  if (!grid) return;

  try {
    const res = await fetch("/api/gallery?page=1&limit=5");
    const data = await res.json();

    if (!data.photos || data.photos.length === 0) {
      grid.outerHTML = `
        <div class="gallery-empty reveal in-view">
          Photos are on the way. The gallery will fill up here as the club
          adds match days, tournaments and team moments.
        </div>`;
      return;
    }

    grid.innerHTML = data.photos
      .map(
        (photo) => `
        <a href="gallery.html" aria-label="View full gallery">
          <img src="${photo.thumbnailUrl}" alt="${escapeHtml(photo.originalFilename)}" loading="lazy" />
        </a>`
      )
      .join("");
  } catch (err) {
    console.error("Could not load gallery preview:", err);
    grid.outerHTML = `
      <div class="gallery-empty reveal in-view">
        Photos are on the way. The gallery will fill up here as the club
        adds match days, tournaments and team moments.
      </div>`;
  }
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const messageBox = document.getElementById("contactFormMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageBox.className = "form-message";
    messageBox.textContent = "";

    const payload = {
      name: document.getElementById("cf-name").value.trim(),
      email: document.getElementById("cf-email").value.trim(),
      phone: document.getElementById("cf-phone").value.trim(),
      message: document.getElementById("cf-message").value.trim(),
    };

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      messageBox.className = "form-message success";
      messageBox.textContent = "Thanks — your message has been sent. We'll get back to you soon.";
      form.reset();
    } catch (err) {
      messageBox.className = "form-message error";
      messageBox.textContent = err.message || "Could not send your message. Please try again.";
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}
