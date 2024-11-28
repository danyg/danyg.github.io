/**
 * @author Daniel Goberitz <danyg>
 */
(function () {
  class Pages {
    constructor() {
      onReady(this.onDomReady.bind(this));
      window.addEventListener("beforeprint", this.onBeforePrint.bind(this));
      window.addEventListener("afterprint", this.onAfterPrint.bind(this));
    }

    isPrintingMode() {
      return window.matchMedia("print").matches;
    }

    onDomReady() {
      this.start();
    }

    start() {
      if (this.isPrintingMode()) return;

      this.body = document.body;
      this.addClass(this.body, "with-pages");
      this.createPages();
    }

    onBeforePrint() {
      console.log("onBeforePrint");
      const pages = Array.from(document.querySelectorAll(".din-a4"));

      pages
        .map((page) => Array.from(page.children))
        .flat()
        .forEach((elm) => document.body.appendChild(elm));

      pages.forEach((p) => p.parentElement.removeChild(p));
    }

    onAfterPrint() {
      this.start();
    }

    createPages() {
      let remainingSections = this.getSections();
      do {
        remainingSections = this.createPage(remainingSections);
      } while (remainingSections.length > 0);
    }

    createPage(sectionsToAllocate) {
      const page = this.buildPage();
      const maxHeight = page.offsetHeight;
      let currentHeight = 0;
      const remainingSections = [].concat(sectionsToAllocate);
      let lastSection;

      for (let section of sectionsToAllocate) {
        const h = this.getOuterHeightOf(section);
        if (currentHeight + h < maxHeight || h > maxHeight) {
          page.appendChild(section);
          currentHeight += h;
          remainingSections.splice(0, 1);
          lastSection = section;
          continue;
        }
        if (lastSection) {
          this.addClass(lastSection, "page-breaker");
        }
        break;
      }

      return remainingSections;
    }

    buildPage() {
      const page = document.createElement("div");
      page.className = "din-a4 page-breaker";
      this.body.appendChild(page);
      return page;
    }

    getSections() {
      return Array.from(this.body.querySelectorAll("section"));
    }

    getOuterHeightOf(el) {
      // from http://youmightnotneedjquery.com/
      let height = el.offsetHeight;
      const style = getComputedStyle(el);

      height += parseInt(style.marginTop) + parseInt(style.marginBottom);
      return height;
    }

    addClass(el, className) {
      el.className += (el.className.length > 0 ? " " : "") + className;
    }
  }

  window.pages = new Pages();
})();
