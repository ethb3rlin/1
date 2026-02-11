# Repository Guidelines

## Project Structure & Module Organization
This repository is a static archive of the ETHBerlin 2018 site. The root contains `index.html` plus top-level content folders like `about/`, `schedule/`, `locations/`, `photos/`, and `sponsors/`. WordPress-exported assets live under `wp-content/` (themes, plugins, cache) and `wp-includes/` (core assets). Static policy/legal pages live in `imprint/` and `privacy-policy/`. Treat this as a static site: there is no application source directory or build pipeline.

## Build, Test, and Development Commands
There is no build system or test runner in this repo.

- Local preview: open `index.html` in a browser or serve the root with any static file server (e.g., `python -m http.server`).
- Content edits: edit the relevant HTML file in place (for example, `schedule/index.html`).

## Coding Style & Naming Conventions
- HTML/CSS/JS assets are largely minified and vendor-generated. Avoid reformatting or editing files under `wp-content/cache/`, `wp-includes/`, and minified theme/plugin assets unless you are updating a vendor file.
- Keep filenames and folder names lowercase and hyphenated to match existing patterns (e.g., `privacy-policy/`, `culture-room/`).
- Prefer targeted, minimal diffs to preserve the archival nature of the site.

## Testing Guidelines
No automated tests are defined. Validate changes by loading the affected pages in a browser and checking for broken links, missing images, and layout regressions. For asset changes, verify that paths resolve relative to the site root.

## Commit & Pull Request Guidelines
- Commit messages in the history are short, imperative, and capitalized (e.g., “Create CNAME”, “fix google fonts”). Follow the same style.
- PRs should describe what changed and why. Include screenshots for any visual or layout updates, and list the pages you manually verified.

## Configuration & Hosting Notes
- `CNAME` configures the custom domain for GitHub Pages. Avoid removing or renaming it unless the domain changes.
- This repo is an archive; avoid large refactors or dependency updates that alter the historical look and feel.
