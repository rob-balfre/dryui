import type { ThemeTokens } from '@dryui/theme-wizard';
import {
	pickThemeTokens,
	SIDEBAR_PREVIEW_TOKEN_NAMES
} from '../../../../../packages/mcp/src/theme-tokens.js';

export const DEFAULT_DOCS_THEME_TOKENS: ThemeTokens = pickThemeTokens(SIDEBAR_PREVIEW_TOKEN_NAMES);
