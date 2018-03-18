/**
 * @author Daniel Goberitz <danyg>
 */
(function() {
	class Pages {
		constructor() {
			document.addEventListener(
				'DOMContentLoaded',
				this.onDomReady.bind(this)
			);
		}

		onDomReady() {
			this.body = document.body;
			this.addClass(this.body, 'with-pages');
			this.createPages();
		}

		createPages() {
			let remainingSections = this.getSections();
			do {
				remainingSections = this.createPage(remainingSections);
			} while(remainingSections.length > 0);
		}

		createPage(sectionsToAllocate) {
			const page = this.buildPage();
			const maxHeight = page.offsetHeight;
			let currentHeight = 0;
			const remainingSections = [].concat(sectionsToAllocate);
			let lastSection;

			for(let section of sectionsToAllocate) {
				const h = this.getOuterHeightOf(section);
				if(currentHeight + h < maxHeight || h > maxHeight) {
					page.appendChild(section);
					currentHeight += h;
					remainingSections.splice(0,1);
					lastSection = section;
					continue;
				}
				if(lastSection) {
					this.addClass(lastSection, 'page-breaker');
				}
				break;
			}

			return remainingSections;
		}

		buildPage() {
			const page = document.createElement('div');
			page.className = 'din-a4';
			this.body.appendChild(page);
			return page;
		}

		getSections() {
			return Array.from(this.body.querySelectorAll('section'));
		}

		getOuterHeightOf(el) {
			// from http://youmightnotneedjquery.com/
			let height = el.offsetHeight;
			const style = getComputedStyle(el);

			height += parseInt(style.marginTop) + parseInt(style.marginBottom);
			return height;
		}

		addClass(el, className) {
			el.className += (el.className.length > 0 ? ' ' : '') + className;
		}
	}

	window.pages = new Pages();
})();
