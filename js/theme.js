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

	var ITCH_THEME = {
		light: {
			bg_color: 'ffffff',
			fg_color: '0d0d0d',
			link_color: 'fa5c5c',
			border_color: '0d0d0d'
		},
		dark: {
			bg_color: '1c1c1c',
			fg_color: 'f5f5f5',
			link_color: 'ffde44',
			border_color: 'e8e8e8'
		}
	};

	function itchEmbedSrc(id, theme) {
		var colors = ITCH_THEME[theme];
		if (!id || !colors) {
			throw new Error('itch embed missing id or theme colors');
		}
		return 'https://itch.io/embed/' + id
			+ '?bg_color=' + colors.bg_color
			+ '&fg_color=' + colors.fg_color
			+ '&link_color=' + colors.link_color
			+ '&border_color=' + colors.border_color;
	}

	function syncItchWidgets(theme) {
		var frames = document.querySelectorAll('iframe[data-itch-embed]');
		for (var i = 0; i < frames.length; i++) {
			var frame = frames[i];
			var id = frame.getAttribute('data-itch-embed');
			var next = itchEmbedSrc(id, theme);
			if (frame.getAttribute('src') !== next) {
				frame.setAttribute('src', next);
			}
		}
	}

	function applyTheme(theme, persist) {
		document.documentElement.setAttribute('data-theme', theme);
		if (persist) {
			localStorage.setItem(STORAGE_KEY, theme);
		}
		syncButtons(theme);
		syncItchWidgets(theme);
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
	syncItchWidgets(currentTheme());

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
