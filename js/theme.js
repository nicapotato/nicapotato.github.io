(function () {
	'use strict';

	var STORAGE_KEY = 'nt-theme';

	function storedTheme() {
		var stored = localStorage.getItem(STORAGE_KEY);
		return (stored === 'light' || stored === 'dark') ? stored : null;
	}

	function currentTheme() {
		return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
	}

	function applyTheme(theme, persist) {
		document.documentElement.setAttribute('data-theme', theme);
		if (persist) {
			localStorage.setItem(STORAGE_KEY, theme);
		}
		syncButtons(theme);
	}

	function syncButtons(theme) {
		var target = theme === 'dark' ? 'light' : 'dark';
		var label = target === 'dark' ? 'Dark' : 'Light';
		var aria = 'Switch to ' + target + ' mode';
		var pressed = theme === 'dark' ? 'true' : 'false';
		var buttons = document.querySelectorAll('.nt-theme-toggle');
		for (var i = 0; i < buttons.length; i++) {
			var btn = buttons[i];
			btn.setAttribute('aria-label', aria);
			btn.setAttribute('aria-pressed', pressed);
			var labelEl = btn.querySelector('.nt-theme-toggle__label');
			if (labelEl) {
				labelEl.textContent = label;
			}
		}
	}

	function toggleTheme() {
		applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
	}

	var buttons = document.querySelectorAll('.nt-theme-toggle');
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener('click', toggleTheme);
	}

	syncButtons(currentTheme());

	var media = window.matchMedia('(prefers-color-scheme: dark)');
	function onSystemChange(event) {
		if (storedTheme()) {
			return;
		}
		applyTheme(event.matches ? 'dark' : 'light', false);
	}
	if (typeof media.addEventListener === 'function') {
		media.addEventListener('change', onSystemChange);
	} else if (typeof media.addListener === 'function') {
		media.addListener(onSystemChange);
	}
})();
