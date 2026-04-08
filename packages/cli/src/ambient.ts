#!/usr/bin/env node
// dryui ambient — Print compact project context for agent session hooks.
// Designed to be registered as a Claude Code prompt_submit hook.
// Exits silently if not in a DryUI project.

import spec from '../../mcp/src/spec.json';
import { detectProject } from '../../mcp/src/project-planner.js';
import { toonProjectDetection } from '@dryui/mcp/toon';

try {
	const detection = detectProject(spec, undefined);

	// Only print context if we detected a DryUI project (has package.json with dryui deps or theme files)
	if (detection.dependencies.ui || detection.dependencies.primitives) {
		console.log(toonProjectDetection(detection));
	}
} catch {
	// Not in a DryUI project or detection failed — exit silently
}
