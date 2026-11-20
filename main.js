(() => {
  const content = window.PORTFOLIO_CONTENT;
  const languageButton = document.getElementById("languageToggle");
  const menuButton = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  let language = localStorage.getItem("elia-language") || "id";

  function applyLanguage(nextLanguage) {
    language = nextLanguage;
    document.documentElement.lang = language;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      const translation = content[language]?.[key];
      if (translation !== undefined) element.innerHTML = translation;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      const translation = content[language]?.[key];
      if (translation !== undefined) element.setAttribute("placeholder", translation);
    });
    languageButton.setAttribute("aria-label", language === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia");
    languageButton.innerHTML = language === "id" ? '<strong>ID</strong> <span>/</span> EN' : 'ID <span>/</span> <strong>EN</strong>';
    localStorage.setItem("elia-language", language);
  }

  languageButton.addEventListener("click", () => applyLanguage(language === "id" ? "en" : "id"));

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
    mobileNav.hidden = isOpen;
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  // Animasi ringan saat elemen masuk layar, dengan fallback untuk browser lama.
  const revealTargets = document.querySelectorAll(".section-index, .section-content, .interest-card, .timeline-item, .vision-layout, .contact-content");
  revealTargets.forEach((element) => element.classList.add("reveal"));
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((element) => observer.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  }

  applyLanguage(language);

  // MODE PENGUNJUNG: foto hanya dimuat dari penyimpanan browser yang sudah ada.
  // Tidak ada kontrol unggah, ganti, atau hapus foto pada halaman publik.
  const PHOTO_DB = "elia-portfolio-photos";
  const PHOTO_STORE = "photos";

  function openPhotoDB() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("IndexedDB tidak tersedia."));
      const request = indexedDB.open(PHOTO_DB, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(PHOTO_STORE)) {
          request.result.createObjectStore(PHOTO_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function loadPhoto(key) {
    const db = await openPhotoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, "readonly");
      const request = tx.objectStore(PHOTO_STORE).get(key);
      request.onsuccess = () => { db.close(); resolve(request.result || null); };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  }

  // Form kontak statis: menyiapkan email ke alamat Elia melalui aplikasi email pengunjung.
  // Pengunjung tetap perlu menekan tombol Send/Kirim di aplikasi email mereka.
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      const formData = new FormData(contactForm);
      const senderName = String(formData.get("name") || "").trim();
      const senderEmail = String(formData.get("email") || "").trim();
      const senderMessage = String(formData.get("message") || "").trim();
      const subject = `Pesan portofolio dari ${senderName}`;
      const body = [
        `Nama: ${senderName}`,
        `Email: ${senderEmail}`,
        "",
        "Pesan:",
        senderMessage
      ].join("\\n");
      const mailto = `mailto:eliakyanbartram@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    });
  }

  document.querySelectorAll("img[src$='.jpg']").forEach((img) => {
    const key = img.getAttribute("src");
    loadPhoto(key).then((file) => {
      if (!file) return;
      const url = URL.createObjectURL(file);
      img.src = url;
      img.dataset.objectUrl = url;
      const slot = img.closest(".image-frame, .card-image, .gallery-item, .vision-image") || img.parentElement;
      if (slot) slot.classList.remove("image-missing");
    }).catch(() => {
      // Jika belum ada foto tersimpan di browser ini, gunakan gambar bawaan.
    });
  });

})();
