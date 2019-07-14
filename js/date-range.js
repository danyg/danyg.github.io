/**
 * @author Daniel Goberitz <danyg>
 */
(function () {
	const YEAR_MS = 1000 * 60 * 60 * 24 * 365;
	const MONTH_MS = 1000 * 60 * 60 * 24 * 30;
	const TODAY = 'TODAY';

	class DataRange {
		/**
		 * @param {string} start
		 * @param {string} end
		 * @param {Element} element
		 */
		constructor(start, end, element) {
			this.start = new Date(start);
			this.end = end === TODAY ? TODAY : new Date(end);
			this.element = element;
			this.render();
		}

		render() {
			this.element.innerHTML = '';
			LANGS
				.map(this.getDateElement.bind(this))
				.forEach(element => this.element.appendChild(element))
			;

			window.lang.start();
		}

		getDateElement(lang) {
			const elm = document.createElement('span');
			elm.setAttribute('lang', lang);
			elm.innerHTML = `${this.getDateString(this.start, lang)} - ${this.getDateString(this.end, lang)} (${this.getDeltaString(lang)})`;
			return elm;
		}

		/**
		 * @param {Date} date
		 * @param {string} lang
		 */
		getDateString(date, lang) {
			return date === TODAY ? M_I18N[lang][TODAY] : `${SHORT_MONTHS[lang][date.getMonth()]} ${date.getFullYear()}`
		}

		getDeltaTime() {
			const end = this.end === TODAY ? new Date() : this.end;
			const deltaMs = end - this.start;
			const years = Math.floor(deltaMs / YEAR_MS);
			const months = Math.floor((deltaMs - (years * YEAR_MS)) / MONTH_MS);
			return {
				years,
				months
			};
		}

		getDeltaString(lang) {
			const delta = this.getDeltaTime();
			const out = [];
			if (delta.years > 0) {
				out.push(`${delta.years}${M_I18N[lang].years_short}`)
			}
			if (delta.months > 0) {
				out.push(`${delta.months}${M_I18N[lang].months_short}`)
			}
			return out.join(' ');
		}
	}

	/** @param {Element} element */
	const buildDataRange = (element) => new DataRange(
		element.getAttribute('data-date-start'),
		element.getAttribute('data-date-end'),
		element
	);

	const dateRangesElements = () => Array.from(document.querySelectorAll('.date-range'));
	const initDateRanges = () => dateRangesElements().map(buildDataRange);
	onReady(initDateRanges);
})();
