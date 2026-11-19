# Phase 5D — Skill Inventory & Antigravity Compatibility Audit

**Date:** 2026-11-19  
**Branch:** `feat/phase5-visual-enhancement`  
**Scanner Used:** `skill-matcher` (`scripts/scan_skills.py --stats`), scanning **23 source roots** and discovering **249 unique skills**.

---

## 1. Discovery Summary

Skills in this environment live across two primary ecosystems:
1. **Antigravity / OpenCode Global Skills (`/home/hari007/.gemini/config/skills/`, `/home/hari007/.gemini/skills/`, `/home/hari007/.gemini/antigravity-cli/builtin/skills/`):** Advertised directly in Antigravity's `<skills>` system prompt.
2. **Shared Agent Skills (`/home/hari007/.agents/skills/`):** Discovered by OpenCode V2 and `skill-matcher`, readable on disk by Antigravity (`read_file` / `run_command`), **not automatically advertised** in Antigravity's `<skills>` prompt unless symlinked into `~/.gemini/config/skills/`.

---

## 2. Relevant Frontend, Design, UX, Accessibility & Quality Skills Inventory

| Exact Skill Name (`id`) | Source Directory | Advertised in Antigravity `<skills>`? | Purpose & Key Capabilities | Direct Invocation / Dependencies |
| --- | --- | --- | --- | --- |
| `skill-matcher` | `~/.gemini/config/skills/skill-matcher` (symlinked from `~/Projects/Service/Skills/SkillMatcher`) | **Yes** | Decomposes requests into atomic sub-tasks, scores all 249 installed skills via TF-IDF cosine similarity, detects overlaps, selects Core + Support teams. | Python 3 (`scripts/scan_skills.py`, `scripts/match_skills.py`). No external pip deps. |
| `ui-ux-pro-max` | `~/.agents/skills/ui-ux-pro-max` | No (on-disk in `.agents/skills`) | Design intelligence DB: 80 styles, 192 product palettes, 74 font pairings, 120 UX guidelines, 105 icons, 17 GSAP presets, 22 stacks. | Python 3 (`scripts/search.py "<query>" --design-system / --domain / --stack`). Note: `SKILL.md` examples use `${CLAUDE_PLUGIN_ROOT}` — pass absolute path instead. |
| `impeccable` | `~/.agents/skills/impeccable` (v4.8.1) | No (on-disk in `.agents/skills`) | Out-of-distribution visual craft, design direction (`new-work`, `craft`, `shape`, `critique`, `document`, `extract`), anti-slop quality floor (`craft-floor.md`), Persuade vs Operate modes. | Self-contained launcher script (`scripts/impeccable context`). Reads `PRODUCT.md` / `DESIGN.md`. |
| `designing-frontend-interfaces` | `~/.agents/skills/designing-frontend-interfaces` | No (on-disk in `.agents/skills`) | Visual craft & art direction: enforces 8-line Design Brief + locked CSS token block before component code; aesthetic directions & self-review rubric. | Pure instruction skill (no binary deps). Pairs with `designing-user-experience`, `building-accessible-interfaces`. |
| `designing-user-experience` | `~/.agents/skills/designing-user-experience` | No (on-disk in `.agents/skills`) | Behavioral UX: flow mapping, empty/loading/error/partial state matrix, form validation, failure recovery, feedback budgets, touch reach. | Pure instruction skill. |
| `building-accessible-interfaces` | `~/.agents/skills/building-accessible-interfaces` | No (on-disk in `.agents/skills`) | WCAG 2.2 Level AA engineering: semantic HTML (`button` vs `a`), landmarks, keyboard focus traps, 4.5:1 / 3:1 contrast, ARIA live regions, reduced motion, >= 24–44px touch targets. | Pure instruction skill. |
| `reviewing-interface-quality` | `~/.agents/skills/reviewing-interface-quality` | No (on-disk in `.agents/skills`) | Evidence-based UI quality gate using Playwright (1440px + 390px screenshots, computed style consistency audit, overflow detection, severity-graded fixes). | Uses Playwright (installed globally at `/home/hari007/.npm-global/bin/playwright`). |
| `unslop` | `~/.agents/skills/unslop` | No (on-disk in `.agents/skills`) | **Prose/copy anti-AI-tells editor** (`disable-model-invocation: true`): removes superficial `-ing` phrases, AI vocabulary ("elevate", "seamless", "tapestry"), em-dash overuse, rule-of-three padding, filler, and abstract jargon in UX copy/headings. | Pure instruction skill (text/copy only, not visual layout). |
| `nextjs-developer` | `~/.gemini/config/skills/nextjs-developer` | **Yes** | Next.js 14+ App Router, RSC boundaries, metadata, streaming, `loading.tsx`/`error.tsx`, performance. | Pure instruction skill. |
| `react-expert` | `~/.gemini/config/skills/react-expert` | **Yes** | React 18+ component composition, hooks, render performance, state isolation. | Pure instruction skill. |
| `playwright-expert` | `~/.gemini/config/skills/playwright-expert` | **Yes** | Cross-viewport browser regression, visual checks, keyboard/accessibility verification. | Uses Playwright (`@playwright/test` / global Playwright). |
| `gsd-ui-researcher` / `gsd-ui-checker` / `gsd-ui-auditor` | GSD builtin subagents | **Yes** (subagents) | GSD UI-SPEC design contract generation and 6-pillar visual audit. | Invoked via `invoke_subagent`. |

---

## 3. OpenCode-to-Antigravity Compatibility Findings (Step 3)

1. **Format Compatibility:** All skills in `~/.agents/skills/` (`ui-ux-pro-max`, `impeccable`, `designing-frontend-interfaces`, `designing-user-experience`, `building-accessible-interfaces`, `reviewing-interface-quality`, `unslop`) use standard `SKILL.md` YAML frontmatter (`name`, `description`) + Markdown instructions + local `scripts/`/`reference/` folders — **100% compatible** with Antigravity's skill format.
2. **Why They Were Not Auto-Advertised:** Antigravity reads `~/.gemini/config/skills/`, whereas these skills reside in `~/.agents/skills/`.
3. **Minor Path Caveat:** `ui-ux-pro-max/SKILL.md` references `${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py` in examples; in Antigravity, invoke `/home/hari007/.agents/skills/ui-ux-pro-max/scripts/search.py` by absolute path.
4. **Safest Exposure Method (No Overwrites, Preserves Originals):**
   - If the owner wants Antigravity to auto-advertise them in future sessions, create read-only directory symlinks into `~/.gemini/config/skills/` **without copying or modifying** `~/.agents/skills/*`:
     ```bash
     for s in ui-ux-pro-max impeccable designing-frontend-interfaces designing-user-experience building-accessible-interfaces reviewing-interface-quality unslop; do
       [ ! -e "$HOME/.gemini/config/skills/$s" ] && ln -s "$HOME/.agents/skills/$s" "$HOME/.gemini/config/skills/$s"
     done
     ```
   - Notice: none of these 7 names collide with existing entries in `~/.gemini/config/skills/`. (Not executed yet per Section 9 restriction.)
