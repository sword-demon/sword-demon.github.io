# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal technical blog & knowledge-base site. Built with **VitePress** + **vitepress-theme-teek**, deployed to GitHub Pages via GitHub Actions on push to `master`.

Live URL: https://sword-demon.github.io/

## Commands

```bash
pnpm install        # Install dependencies
pnpm docs:dev       # Dev server with hot reload
pnpm docs:build     # Production build -> docs/.vitepress/dist
pnpm docs:preview   # Preview production build locally
```

Requirements: Node.js >= 20, pnpm.

## Architecture

### Config Chain

`docs/.vitepress/config.mts` extends `teekConfig.mts`. The main config handles nav, markdown extensions, and language settings; the Teek config handles theme-specific features (sidebar generation, comments via Giscus, blogger profile, friend links, legend plugin for markmap/mermaid/infographic).

### Content Structure

All content lives under `docs/`. Each top-level subdirectory is a topic section mapped to a nav bar item:

- `docs/views/` — Technology stack notes (go, go-core, go-zero, deploy, rust, java, redis, rabbitmq, vue3, react, adonisjs, socket)
- `docs/algo/` — Algorithms & data structures (~43 articles)
- `docs/ai/` — AI tools notes (hermes, skills, tools, workflows)
- `docs/linux/` — Linux, C kernel, processes
- `docs/posts/` — Essays and misc
- `docs/interview/` — Interview prep
- `docs/kratos/` — Kratos microservice framework
- `docs/python/base/` — Python basics
- `docs/flutter/` — Flutter setup
- `docs/guide/` — Site usage guide

### Special Pages

Feature pages use Teek-specific frontmatter flags:
- `docs/@pages/archivesPage.md` — `archivesPage: true`
- `docs/categories.md` — `categoriesPage: true`
- `docs/tags.md` — `tagsPage: true`
- `docs/index.md` — Teek home layout with banner + features

### Markdown Extensions

The site uses custom Chinese container labels, line numbers on code blocks, lazy-loaded images, and language aliases (e.g., `flow` -> bash, `conf` -> ini). These are configured in `config.mts` under `markdown` key.

### Deployment

Push to `master` triggers `.github/workflows/deploy-docs.yml`: Node 20 setup -> pnpm install -> build -> deploy `docs/.vitepress/dist` to `gh-pages` branch.

### Legacy Files

`docs/home.md` and `docs/slide.md` are leftovers from a prior VuePress migration and are not used by the current Teek-based setup.

## Adding New Articles

Create a `.md` file in the appropriate topic directory with standard VitePress frontmatter (title, date, tags, categories). The Teek theme auto-generates sidebar entries, ignoring `index.md` and `assets/` directories.
