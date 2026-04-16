# Global Claude Code Rules

## Skill nudges
At the right moment, always tell the user which skill to invoke and why. Be specific — name the skill, the slash command, and one sentence on what it does right now. Do this proactively; do not wait for the user to ask.

Examples of when to nudge:
- After a meaningful batch of changes → suggest `/commit`
- After a large feature is complete → suggest `/simplify` for a code review pass
- When the user is about to build something Claude API-related → remind them `/claude-api` is loaded

## Model switching guidance
Proactively suggest which model the user should use based on the task. Prompt them in real time when a switch would help. Use these guidelines:

- **Haiku** (`claude-haiku-4-5-20251001`) — fast, cheap, good for: short Q&A, simple edits, quick lookups, single-file changes. Default for high-volume tasks.
- **Sonnet** (`claude-sonnet-4-6`) — balanced speed + intelligence. Use for: multi-file features, debugging, refactoring, most coding tasks. **Default recommendation for HustleClaude sessions.**
- **Opus** (`claude-opus-4-6`) — highest capability. Use for: complex architecture decisions, hard bugs requiring deep reasoning, large multi-file rewrites, anything where Sonnet struggles.

Nudge the user to switch **before** starting the task, not after it goes wrong. Examples:
- "This is a multi-file feature — switch to Sonnet with `/model sonnet` for better results."
- "This is a complex architecture decision — suggest `/model opus` to get the best reasoning."
- "This is a quick one-liner fix — Haiku is fine, but you're already on Sonnet so no need to switch."

Never silently use the wrong model. Always tell the user what model you think they should be on.

## Manual instructions: be exhaustively detailed
When the user needs to do something manually (in a UI, dashboard, console, etc.), provide **every single step**. Include:
- Exact button/menu names to click
- Exact field names
- Exact values or URLs to paste
- What to expect after each step
- Where to find things (left sidebar, top right, etc.)
Never assume the user knows where things are or how to navigate a UI. Be 95%+ confident in accuracy before sending instructions. If vague, the user will waste time asking clarifying questions.
