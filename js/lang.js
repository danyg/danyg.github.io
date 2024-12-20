/**
 * @author Daniel Goberitz <danyg>
 */
(function () {
  const iconByLang = {
    en: "gb",
    es: "es",
  };

  class Lang {
    constructor() {
      this.createdLangs = [];
      onReady(this.onDomReady.bind(this));
    }

    onDomReady() {
      this.start();
    }

    start() {
      this.body = document.body;
      this.showLangSelector();
      this.readQS();
      this.showRequestedLang();
    }

    readQS() {
      this.qs = {};
      window.location.search
        .substring(1)
        .split("&")
        .forEach((pair) => {
          const kv = pair.split("=");
          this.qs[kv[0]] = kv[1];
        });
    }

    showRequestedLang() {
      this.showLang(this.getRequestedLang());
    }

    getRequestedLang() {
      return this.qs.hasOwnProperty("lang") ? this.qs.lang : document.body.parentElement.lang;
    }

    showLang(lang) {
      document.body.querySelectorAll(`[lang]`).forEach((itm) => {
        itm.style.display = itm.getAttribute("lang") === lang ? "" : "none";
      });
    }

    showLangSelector() {
      this.checkAvailableLanguages();
      const selector = this.buildSelector();
      console.log(this.availableLangs);
      this.availableLangs.forEach((lang) => {
        if (this.createdLangs.includes(lang)) return;
        this.createdLangs.push(lang);

        const btn = this.createButton();
        btn.appendChild(this.createFlag(lang));
        btn.addEventListener("click", this.changeLang.bind(this, lang));
        selector.appendChild(btn);
      });
    }

    buildSelector() {
      if (this._selector) return this._selector;

      this._selector = document.createElement("dl");
      this._selector.className = "selector";
      this.body.appendChild(this._selector);

      return this._selector;
    }

    createButton() {
      const selector = document.createElement("dd");
      selector.className = "lang";
      return selector;
    }

    createFlag(lang) {
      //<i class="flag-icon flag-icon-es"></i>
      const icon = this.getIconPerLang(lang);
      const flag = document.createElement("i");
      flag.className = `flag-icon flag-icon-${icon}`;
      return flag;
    }

    checkAvailableLanguages() {
      this.availableLangs = [];
      this.body.querySelectorAll(`[lang]`).forEach((itm) => {
        const lang = itm.lang;
        if (!this.availableLangs.includes(lang)) {
          this.availableLangs.push(lang);
        }
      });
    }

    getIconPerLang(lang) {
      if (iconByLang.hasOwnProperty(lang)) {
        return iconByLang[lang];
      }
      throw new TypeError(`No icon found for language ${lang}`);
    }

    changeLang(lang) {
      const l = window.location;
      const state = {
        lang,
      };
      const url = `${l.protocol}//${l.host}${l.pathname}?lang=${lang}`;
      window.history.pushState(state, window.title, url);
      this.showLang(lang);
    }
  }

  window.lang = new Lang();
})();
