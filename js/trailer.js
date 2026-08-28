(function () {
	'use strict';

	var YT_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

	var modal = null;
	var iframe = null;
	var titleEl = null;
	var closeBtn = null;
	var lastFocus = null;

	function youtubeSrc(id) {
		if (!YT_ID_RE.test(id)) {
			throw new Error('Invalid YouTube video id: ' + id);
		}
		return 'https://www.youtube.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
	}

	function ensureModal() {
		if (modal) {
			return;
		}

		modal = document.createElement('div');
		modal.className = 'nt-trailer-modal';
		modal.setAttribute('hidden', '');
		modal.innerHTML =
			'<div class="nt-trailer-modal__backdrop" data-trailer-dismiss="true"></div>' +
			'<div class="nt-trailer-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="nt-trailer-title">' +
				'<div class="nt-trailer-modal__bar">' +
					'<p class="nt-trailer-modal__title" id="nt-trailer-title">Trailer</p>' +
					'<button type="button" class="nt-trailer-modal__close" data-trailer-dismiss="true">Close</button>' +
				'</div>' +
				'<div class="nt-trailer-modal__frame">' +
					'<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="Trailer"></iframe>' +
				'</div>' +
			'</div>';
		document.body.appendChild(modal);

		iframe = modal.querySelector('iframe');
		titleEl = modal.querySelector('#nt-trailer-title');
		closeBtn = modal.querySelector('.nt-trailer-modal__close');
		if (!iframe || !titleEl || !closeBtn) {
			throw new Error('Trailer modal markup is incomplete');
		}

		modal.addEventListener('click', function (event) {
			if (event.target.closest('[data-trailer-dismiss="true"]')) {
				closeTrailer();
			}
		});
	}

	function openTrailer(id, title, trigger) {
		ensureModal();
		lastFocus = trigger || document.activeElement;
		titleEl.textContent = title || 'Trailer';
		iframe.setAttribute('title', title || 'Trailer');
		iframe.src = youtubeSrc(id);
		modal.removeAttribute('hidden');
		document.body.classList.add('nt-trailer-open');
		closeBtn.focus();
	}

	function closeTrailer() {
		if (!modal || modal.hasAttribute('hidden')) {
			return;
		}
		iframe.src = '';
		modal.setAttribute('hidden', '');
		document.body.classList.remove('nt-trailer-open');
		if (lastFocus && typeof lastFocus.focus === 'function') {
			lastFocus.focus();
		}
	}

	document.addEventListener('click', function (event) {
		var trigger = event.target.closest('[data-youtube-id]');
		if (!trigger) {
			return;
		}
		var id = trigger.getAttribute('data-youtube-id');
		if (!id) {
			throw new Error('Trailer trigger is missing data-youtube-id');
		}
		event.preventDefault();
		openTrailer(id, trigger.getAttribute('data-youtube-title'), trigger);
	});

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape') {
			closeTrailer();
		}
	});
})();
