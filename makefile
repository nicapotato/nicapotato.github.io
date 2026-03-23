# Local static site server (same layout as GitHub Pages root).
# Run from repo root: make serve

.PHONY: help serve

PORT ?= 8800

help:
	@echo "nicapotato.github.io — local development"
	@echo "  make serve              serve at http://localhost:$(PORT)/"
	@echo "  PORT=3000 make serve    use another port"

serve:
	@echo "Serving . on http://localhost:$(PORT)/ — open index.html via that URL"
	python3 -m http.server $(PORT)
