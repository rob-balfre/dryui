#!/usr/bin/env bash
# Best-effort feedback agent setup for DryUI consumer projects.
#
# Creates project-local skill copies, writes dryui.config.json with a detected
# feedback default agent, and merges project-local MCP entries where the editor
# has a project config file.

set -euo pipefail

PROJECT_DIR="${1:-.}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILLS_ROOT="$(cd "$SKILL_DIR/.." && pwd)"

cd "$PROJECT_DIR"

MCP_ENTRY_NPX='{"command":"npx","args":["-y","-p","@dryui/feedback-server","dryui-feedback-mcp"]}'
MCP_ENTRY_STDIO_SH='{"type":"stdio","command":"sh","args":["-c","cd \"${TMPDIR:-/tmp}\" && exec npx -y -p @dryui/feedback-server dryui-feedback-mcp"]}'
MCP_ENTRY_OPENCODE='{"type":"local","command":["npx","-y","-p","@dryui/feedback-server","dryui-feedback-mcp"]}'

has_command() {
	command -v "$1" >/dev/null 2>&1
}

has_mac_app() {
	[ "$(uname -s)" = "Darwin" ] || return 1
	[ -d "/Applications/$1.app" ] || [ -d "$HOME/Applications/$1.app" ]
}

contains_agent() {
	local needle="$1"
	shift
	for entry in "$@"; do
		[ "$entry" = "$needle" ] && return 0
	done
	return 1
}

DETECTED_AGENTS=()

add_agent() {
	local agent="$1"
	if ! contains_agent "$agent" "${DETECTED_AGENTS[@]}"; then
		DETECTED_AGENTS+=("$agent")
	fi
}

if has_command codex || has_mac_app Codex; then add_agent codex; fi
if has_command claude; then add_agent claude; fi
if has_command gemini; then add_agent gemini; fi
if has_command opencode; then add_agent opencode; fi
if has_command copilot; then add_agent copilot; fi
if has_command code || has_command code-insiders || has_mac_app "Visual Studio Code" || has_mac_app "Visual Studio Code - Insiders"; then add_agent copilot-vscode; fi
if has_command cursor || has_mac_app Cursor; then add_agent cursor; fi
if has_command windsurf || has_mac_app Windsurf; then add_agent windsurf; fi
if has_command zed || has_mac_app Zed; then add_agent zed; fi

is_dispatch_agent() {
	case "$1" in
		claude|codex|gemini|opencode|copilot|copilot-vscode|cursor|windsurf|zed|off) return 0 ;;
		*) return 1 ;;
	esac
}

DEFAULT_AGENT="${DETECTED_AGENTS[0]:-off}"
DEFAULT_AGENT_FORCED=false
if [ -n "${DRYUI_DISPATCH_AGENT:-}" ] && is_dispatch_agent "$DRYUI_DISPATCH_AGENT"; then
	DEFAULT_AGENT="$DRYUI_DISPATCH_AGENT"
	DEFAULT_AGENT_FORCED=true
fi

json_array() {
	if [ "$#" -eq 0 ]; then
		printf '[]'
		return
	fi
	printf '%s\n' "$@" | jq -R . | jq -s .
}

merge_json_entry() {
	local path="$1"
	local root_key="$2"
	local entry_key="$3"
	local entry_json="$4"
	local tmp

	mkdir -p "$(dirname "$path")"
	if [ ! -f "$path" ]; then
		printf '{}\n' > "$path"
	fi

	tmp="$(mktemp)"
	if jq --arg rootKey "$root_key" --arg entryKey "$entry_key" --argjson entry "$entry_json" '
		if type != "object" then error("config root must be a JSON object") else . end
		| .[$rootKey] = ((.[$rootKey] // {}) + {($entryKey): $entry})
	' "$path" > "$tmp"; then
		mv "$tmp" "$path"
	else
		rm -f "$tmp"
		echo "[dryui-init] warning: could not merge $entry_key into $path" >&2
		return 1
	fi
}

copy_project_skills() {
	if [ ! -d "$SKILLS_ROOT" ] || [ ! -f "$SKILLS_ROOT/dryui-feedback/SKILL.md" ]; then
		echo "[dryui-init] warning: sibling DryUI skills not found; skipping project-local skill copies" >&2
		return 0
	fi

	for target in skills .agents/skills .claude/skills .codex/skills; do
		mkdir -p "$target"
		for skill_path in "$SKILLS_ROOT"/dryui-*; do
			[ -f "$skill_path/SKILL.md" ] || continue
			local skill_name
			skill_name="$(basename "$skill_path")"
			mkdir -p "$target/$skill_name"
			cp -R "$skill_path/." "$target/$skill_name/"
			find "$target/$skill_name" -name .DS_Store -delete
		done
	done
	echo "[dryui-init] copied project-local DryUI skills for agent discovery"
}

write_dryui_config() {
	local detected_json configured_json tmp
	detected_json="$(json_array "${DETECTED_AGENTS[@]}")"
	configured_json="$(json_array "${CONFIGURED_FILES[@]}")"
	[ -f dryui.config.json ] || printf '{}\n' > dryui.config.json
	tmp="$(mktemp)"

	jq \
		--arg defaultAgent "$DEFAULT_AGENT" \
		--argjson defaultAgentForced "$DEFAULT_AGENT_FORCED" \
		--argjson detectedAgents "$detected_json" \
		--argjson configuredFiles "$configured_json" \
		--argjson mcpServer "$MCP_ENTRY_NPX" \
		'
		if type != "object" then error("config root must be a JSON object") else . end
		| .["$schema"] = (.["$schema"] // "https://dryui.dev/config.schema.json")
		| .feedback = (
			(.feedback // {})
			| .defaultAgent = (
				if ($defaultAgentForced or .defaultAgent == null) then $defaultAgent else .defaultAgent end
			)
			| .terminalApp = (.terminalApp // "terminal")
			| .detectedAgents = $detectedAgents
			| .configuredFiles = $configuredFiles
			| .mcpServer = $mcpServer
			| .manualAgentConfig = {
				codex: "~/.codex/config.toml",
				gemini: "~/.gemini/settings.json",
				windsurf: "~/.codeium/windsurf/mcp_config.json",
				zed: "~/.config/zed/settings.json",
				copilot: "~/.copilot/mcp-config.json"
			}
		)
	' dryui.config.json > "$tmp" && mv "$tmp" dryui.config.json
}

CONFIGURED_FILES=()

copy_project_skills

if contains_agent claude "${DETECTED_AGENTS[@]}" || contains_agent copilot "${DETECTED_AGENTS[@]}"; then
	if merge_json_entry .mcp.json mcpServers dryui-feedback "$MCP_ENTRY_STDIO_SH"; then
		CONFIGURED_FILES+=(".mcp.json")
	fi
fi

if contains_agent copilot-vscode "${DETECTED_AGENTS[@]}"; then
	if merge_json_entry .vscode/mcp.json servers dryui-feedback "$MCP_ENTRY_STDIO_SH"; then
		CONFIGURED_FILES+=(".vscode/mcp.json")
	fi
fi

if contains_agent cursor "${DETECTED_AGENTS[@]}"; then
	if merge_json_entry .cursor/mcp.json mcpServers dryui-feedback "$MCP_ENTRY_NPX"; then
		CONFIGURED_FILES+=(".cursor/mcp.json")
	fi
fi

if contains_agent opencode "${DETECTED_AGENTS[@]}"; then
	if merge_json_entry opencode.json mcp dryui-feedback "$MCP_ENTRY_OPENCODE"; then
		CONFIGURED_FILES+=("opencode.json")
	fi
fi

write_dryui_config

if [ "${#DETECTED_AGENTS[@]}" -eq 0 ]; then
	echo "[dryui-init] no installed feedback agents detected; wrote dryui.config.json with defaultAgent=off"
else
	echo "[dryui-init] detected feedback agents: ${DETECTED_AGENTS[*]} (default=$DEFAULT_AGENT)"
fi

if [ "${#CONFIGURED_FILES[@]}" -gt 0 ]; then
	echo "[dryui-init] configured feedback MCP in: ${CONFIGURED_FILES[*]}"
else
	echo "[dryui-init] no project-local MCP files matched detected agents; see dryui.config.json manualAgentConfig"
fi
