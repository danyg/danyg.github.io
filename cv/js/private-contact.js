/**
 * @author Daniel Goberitz <danyg>
 */
(function () {
  const CONTACT_CLASS = "private-contact";
  const PHONE_STORAGE_KEY = "cv.phone";
  const EMAIL_STORAGE_KEY = "cv.email";

  function removeContactDetails() {
    document.querySelectorAll(`.${CONTACT_CLASS}`).forEach((contact) => contact.remove());
  }

  function createLocalizedLabel(iconClass, englishLabel, spanishLabel) {
    const label = document.createElement("strong");
    const icon = document.createElement("i");
    icon.className = iconClass;
    label.appendChild(icon);

    const english = document.createElement("span");
    english.lang = "en";
    english.textContent = englishLabel;

    const spanish = document.createElement("span");
    spanish.lang = "es";
    spanish.textContent = spanishLabel;

    label.append(english, spanish);
    return label;
  }

  function showContactDetails(phone, email) {
    removeContactDetails();

    const contact = document.createElement("p");
    contact.className = CONTACT_CLASS;

    contact.appendChild(createLocalizedLabel("fas fa-mobile-alt", "Phone", "Teléfono"));
    contact.append(` ${phone} `);

    contact.appendChild(createLocalizedLabel("fas fa-envelope", "Email", "Correo electrónico"));
    contact.append(" ");

    const emailLink = document.createElement("a");
    emailLink.href = `mailto:${email}`;
    emailLink.textContent = email;
    contact.appendChild(emailLink);

    const profile = document.querySelector(".vcard .main");
    if (!profile) return;

    profile.appendChild(contact);
    window.lang.showLang(window.lang.getRequestedLang());
  }

  function showStoredContactDetails() {
    const phone = window.localStorage.getItem(PHONE_STORAGE_KEY);
    const email = window.localStorage.getItem(EMAIL_STORAGE_KEY);
    if (phone && email) showContactDetails(phone, email);
  }

  function promptForContactDetails() {
    const phone = window.prompt("Phone number:", window.localStorage.getItem(PHONE_STORAGE_KEY) || "");
    if (phone === null) return;

    const email = window.prompt("Email address:", window.localStorage.getItem(EMAIL_STORAGE_KEY) || "");
    if (email === null) return;

    window.localStorage.setItem(PHONE_STORAGE_KEY, phone);
    window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
    showContactDetails(phone, email);
  }

  document.addEventListener("keydown", (event) => {
    const isShortcut = event.code === "Digit1" && event.ctrlKey && event.shiftKey && (event.altKey || event.metaKey);
    if (!isShortcut) return;

    event.preventDefault();
    promptForContactDetails();
  });

  onReady(showStoredContactDetails);
})();
