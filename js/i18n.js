/* =====================================================
   Homes Maintenance Solution — Bilingual (Arabic default / English) engine

   Arabic is the page's static default — it's already written directly in
   the HTML, so it never needs a JS dictionary. The English dictionary
   (618 keys, /js/en.json) is fetched only when a visitor actually clicks
   the English button, so it never costs anything on first load unless
   it's used. Each element's original Arabic text/HTML/placeholder/
   aria-label is cached the first time it's overwritten, so switching back
   to Arabic just restores it — no Arabic strings need to ship in JS at all.
   ===================================================== */

const LANG_STORAGE_KEY = "plumbpro-lang";

const originalText = new WeakMap();
const originalHtml = new WeakMap();
const originalPlaceholder = new WeakMap();
const originalAriaLabel = new WeakMap();
let originalTitle = null;

function applyLanguage(lang, dict) {
  const html = document.documentElement;
  html.setAttribute("lang", lang);
  html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    if (lang === "ar") {
      if (originalText.has(el)) el.textContent = originalText.get(el);
      return;
    }
    if (!dict) return;
    const key = el.getAttribute("data-i18n");
    if (!dict[key]) return;
    if (!originalText.has(el)) originalText.set(el, el.textContent);
    el.textContent = dict[key];
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    if (lang === "ar") {
      if (originalHtml.has(el)) el.innerHTML = originalHtml.get(el);
      return;
    }
    if (!dict) return;
    const key = el.getAttribute("data-i18n-html");
    if (!dict[key]) return;
    if (!originalHtml.has(el)) originalHtml.set(el, el.innerHTML);
    el.innerHTML = dict[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    if (lang === "ar") {
      if (originalPlaceholder.has(el)) el.setAttribute("placeholder", originalPlaceholder.get(el));
      return;
    }
    if (!dict) return;
    const key = el.getAttribute("data-i18n-placeholder");
    if (!dict[key]) return;
    if (!originalPlaceholder.has(el)) originalPlaceholder.set(el, el.getAttribute("placeholder"));
    el.setAttribute("placeholder", dict[key]);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    if (lang === "ar") {
      if (originalAriaLabel.has(el)) el.setAttribute("aria-label", originalAriaLabel.get(el));
      return;
    }
    if (!dict) return;
    const key = el.getAttribute("data-i18n-aria-label");
    if (!dict[key]) return;
    if (!originalAriaLabel.has(el)) originalAriaLabel.set(el, el.getAttribute("aria-label"));
    el.setAttribute("aria-label", dict[key]);
  });

  const titleKey = document.body.getAttribute("data-title-key") || "meta.title";
  if (lang === "ar") {
    if (originalTitle) document.title = originalTitle;
  } else if (dict && dict[titleKey]) {
    if (!originalTitle) originalTitle = document.title;
    document.title = dict[titleKey];
  }

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const isActive = btn.getAttribute("data-lang") === lang;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });

  sessionStorage.setItem(LANG_STORAGE_KEY, lang);
}

document.addEventListener("DOMContentLoaded", () => {
  const savedLang = sessionStorage.getItem(LANG_STORAGE_KEY) || "ar";

  // Just reflect the active button state — the HTML is already correct
  // Arabic by default, so there's nothing to apply for "ar".
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const isActive = btn.getAttribute("data-lang") === savedLang;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });

  if (savedLang === "en") {
    // Returning mid-session visitor who already switched to English on an
    // earlier page: the page still renders Arabic for an instant (that's
    // the static default), then flips once the dictionary arrives.
    fetch("/js/en.json")
      .then((r) => r.json())
      .then((dict) => {
        window.__en = dict;
        if (sessionStorage.getItem(LANG_STORAGE_KEY) === "en") applyLanguage("en", dict);
      });
  }

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const lang = btn.getAttribute("data-lang");
      if (lang === "en" && !window.__en) {
        window.__en = await fetch("/js/en.json").then((r) => r.json());
      }
      applyLanguage(lang, window.__en);
    });
  });
});
