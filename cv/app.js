(function () {
  const CONTACT_KEYS = { phone: "cv.phone", email: "cv.email" };
  const state = { language: localStorage.getItem("cv.language") || "en", theme: localStorage.getItem("cv.theme") || "dark", data: null };

  const text = (value) => typeof value === "string" ? value : value[state.language];
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
  const sectionHeading = (en, es, eyebrow) => `<div class="panel__heading"><h2>${state.language === "en" ? en : es}</h2><span>${eyebrow || ""}</span></div>`;

  function applyTheme() {
    const isDark = state.theme === "dark";
    document.documentElement.dataset.theme = state.theme;
    const button = document.querySelector("#theme-button");
    if (!button) return;
    button.setAttribute("aria-pressed", String(isDark));
    button.querySelector("i").className = isDark ? "fas fa-sun" : "fas fa-moon";
    button.querySelector("[data-copy=theme]").textContent = state.language === "en"
      ? (isDark ? "Light mode" : "Dark mode")
      : (isDark ? "Modo claro" : "Modo oscuro");
  }

  function contactMarkup() {
    const phone = localStorage.getItem(CONTACT_KEYS.phone);
    const email = localStorage.getItem(CONTACT_KEYS.email);
    return [
      email ? `<a href="mailto:${encodeURIComponent(email)}"><i class="fas fa-envelope"></i>${escapeHtml(email)}</a>` : "",
      phone ? `<a href="tel:${encodeURIComponent(phone)}"><i class="fas fa-mobile-alt"></i>${escapeHtml(phone)}</a>` : ""
    ].join("");
  }

  function render(data) {
    state.data = data;
    document.documentElement.lang = state.language;
    applyTheme();
    document.querySelectorAll(".language-button").forEach((button) => button.classList.toggle("is-active", button.dataset.language === state.language));
    document.querySelector("[data-copy=print]").textContent = state.language === "en" ? "Print / PDF" : "Imprimir / PDF";

    const skills = data.skills.map((skill) => `<li><strong>${escapeHtml(skill.name)}</strong>${skill.detail ? `<small>${escapeHtml(text(skill.detail))}</small>` : ""}${skill.since ? `<small> · ${state.language === "en" ? "since" : "desde"} ${skill.since}</small>` : ""}${skill.years ? `<small> · ${skill.years}</small>` : ""}</li>`).join("");
    const jobs = data.jobs.map((job) => `<li>${job.start || job.end ? `<div class="timeline__date">${escapeHtml(job.start || "")}<br />${escapeHtml(job.end ? text(job.end) : "")}</div>` : ""}<div><div class="timeline__company">${job.country ? `<span class="flag">${escapeHtml(job.country)}</span>` : ""}${escapeHtml(job.company)}</div><div class="timeline__role">${escapeHtml(job.role)}</div></div></li>`).join("");
    const projects = data.projects.map((project) => `<article class="project"><h3>${escapeHtml(text(project.title))}</h3><div class="project__date">${escapeHtml(project.date)}</div><p>${escapeHtml(text(project.description))}</p><div class="chips">${project.tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div></article>`).join("");
    const languages = data.languages.map((language) => `<div class="language-row"><span class="flag">${language.flag}</span><div><strong>${escapeHtml(text(language.name))}</strong><br /><span>${escapeHtml(text(language.level))}</span></div></div>`).join("");

    document.querySelector("#cv").innerHTML = `
      <header class="hero">
        <img class="hero__photo" src="${escapeHtml(data.photo)}" alt="Daniel Goberitz" />
        <div><div class="eyebrow">${state.language === "en" ? "Software developer" : "Desarrollador de software"}</div><h1>${escapeHtml(data.name)}</h1><p class="hero__subtitle">${state.language === "en" ? "Quality-minded full-stack and frontend developer" : "Desarrollador full-stack y frontend orientado a la calidad"}</p></div>
        <div class="hero__contact contact-list"><a href="https://www.linkedin.com/in/daniel-goberitz" target="_blank"><i class="fab fa-linkedin"></i>LinkedIn</a><a href="${escapeHtml(data.links.github)}" target="_blank"><i class="fab fa-github"></i>GitHub</a>${contactMarkup()}</div>
      </header>
      <div class="cv-grid">
        <div class="column">
          <section class="panel panel--accent"><div class="about">${escapeHtml(text(data.about))}</div></section>
          <section class="panel panel--projects"><div>${sectionHeading("Significant projects", "Proyectos destacados", "Selected work")}</div>${projects}</section>
          <section class="panel panel--work-history"><div>${sectionHeading("Work history", "Historial profesional", ">20 years")}</div><ul class="timeline">${jobs}</ul></section>
        </div>
        <aside class="column">
          <section class="panel"><div>${sectionHeading("Profile", "Perfil", "Details")}</div><dl class="meta-list"><div><dt><i class="fas fa-calendar"></i></dt><dd><strong>${state.language === "en" ? "Date of birth" : "Fecha de nacimiento"}</strong>${escapeHtml(data.birthDate)}</dd></div><div><dt><i class="fas fa-id-card"></i></dt><dd><strong>${state.language === "en" ? "Citizenship" : "Ciudadanía"}</strong>${escapeHtml(text(data.citizenship))}</dd></div><div><dt><i class="fas fa-map-marker-alt"></i></dt><dd><strong>${state.language === "en" ? "Residence" : "Residencia"}</strong>${escapeHtml(text(data.location))}</dd></div></dl></section>
          <section class="panel"><div>${sectionHeading("Studies", "Estudios", "Education")}</div><p><strong>${escapeHtml(text(data.education.title))}</strong><br />${escapeHtml(text(data.education.description))}<br />${escapeHtml(data.education.school)}</p></section>
          <section class="panel"><div>${sectionHeading("Languages", "Idiomas", "Communication")}</div>${languages}</section>
          <section class="panel"><div>${sectionHeading("Knowledge", "Conocimientos", "Toolkit")}</div><ul class="skill-list">${skills}</ul><hr /><div class="chips">${data.also.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div></section>
          <section class="panel panel--accent"><div>${sectionHeading("Hobbies", "Aficiones", "Off-screen")}</div><p>${escapeHtml(text(data.hobbies))}</p></section>
        </aside>
      </div>
      <p class="footer-note">${state.language === "en" ? "Updated September 2026 · Private contact details are stored only in this browser" : "Actualizado en septiembre de 2026 · Los datos de contacto privados solo se guardan en este navegador"}</p>`;
  }

  function editPrivateContact() {
    const phone = window.prompt(state.language === "en" ? "Phone number:" : "Número de teléfono:", localStorage.getItem(CONTACT_KEYS.phone) || "");
    if (phone === null) return;
    const email = window.prompt(state.language === "en" ? "Email address:" : "Correo electrónico:", localStorage.getItem(CONTACT_KEYS.email) || "");
    if (email === null) return;
    localStorage.setItem(CONTACT_KEYS.phone, phone);
    localStorage.setItem(CONTACT_KEYS.email, email);
    render(state.data);
  }

  document.addEventListener("keydown", (event) => {
    if (event.code !== "Digit1" || !event.ctrlKey || !event.shiftKey || (!event.altKey && !event.metaKey)) return;
    event.preventDefault();
    editPrivateContact();
  });
  document.addEventListener("click", (event) => {
    const language = event.target.closest("[data-language]")?.dataset.language;
    if (language) { state.language = language; localStorage.setItem("cv.language", language); render(state.data); }
    if (event.target.closest("#theme-button")) {
      state.theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("cv.theme", state.theme);
      applyTheme();
    }
    if (event.target.closest("#print-button")) window.print();
  });

  applyTheme();
  fetch("data.json").then((response) => response.json()).then(render).catch(() => { document.querySelector("#cv").innerHTML = "<p class=\"loading\">Unable to load CV data.</p>"; });
})();
