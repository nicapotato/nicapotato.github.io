# Local static site server (same layout as GitHub Pages root).
# Run from repo root: make serve
#
# After changing site content, regenerate the downloadable PDF:
#   make pdf

.PHONY: help serve pdf

PORT ?= 8800
PDF_PORT ?= 8801
SITE_PDF := nicapotato-com.pdf
CHROME ?= $(shell \
	if [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then \
		echo "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; \
	elif command -v google-chrome >/dev/null 2>&1; then command -v google-chrome; \
	elif command -v chromium >/dev/null 2>&1; then command -v chromium; \
	elif command -v chromium-browser >/dev/null 2>&1; then command -v chromium-browser; \
	fi)

help:
	@echo "nicapotato.github.io — local development"
	@echo "  make serve              serve at http://localhost:$(PORT)/"
	@echo "  PORT=3000 make serve    use another port"
	@echo "  make pdf                print site to $(SITE_PDF) (Chrome headless)"
	@echo "  Regenerating $(SITE_PDF) is required whenever site content changes."

serve:
	@echo "Serving . on http://localhost:$(PORT)/ — open index.html via that URL"
	python3 -m http.server $(PORT)

pdf: ## Headless Chrome → nicapotato-com.pdf (A4, no header/footer)
	@test -n "$(CHROME)" || (echo "Chrome/Chromium not found. Open the site and Print → Save as PDF."; exit 1)
	@python3 -m http.server $(PDF_PORT) --bind 127.0.0.1 >/tmp/nicapotato-http.log 2>&1 & echo $$! > /tmp/nicapotato-http.pid
	@sleep 0.4
	@"$(CHROME)" --headless --disable-gpu --no-pdf-header-footer \
		--virtual-time-budget=8000 \
		--print-to-pdf="$(CURDIR)/$(SITE_PDF)" \
		"http://127.0.0.1:$(PDF_PORT)/"
	@kill `cat /tmp/nicapotato-http.pid` 2>/dev/null || true
	@rm -f /tmp/nicapotato-http.pid
	@echo "Wrote $(SITE_PDF)"
