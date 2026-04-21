---
'@dryui/cli': minor
---

Gemini CLI is now auto-installable via `dryui setup --editor gemini --install` — it merges both `dryui` and `dryui-feedback` MCP servers into `~/.gemini/settings.json`, preserving other keys. Previously `setup` only printed manual instructions for Gemini, so users who went the manual route before the extension existed often ended up with only `dryui` registered and silent feedback failures when the browser feedback flow tried to call `feedback_get_submissions`.

The agent status probe now also:

- detects a Gemini extension installed via `gemini extensions install <path>` by scanning `~/.gemini/extensions/*/gemini-extension.json` for `name: "dryui"` (reports `source: 'plugin'` or `'mixed'` instead of `'none'`);
- tracks whether `dryui-feedback` is wired alongside `dryui` for every editor, surfaces it as a new `feedback` column in the Agents table and a `(no feedback)` tag in the text summary when the feedback server is missing.
