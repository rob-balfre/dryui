/* Headless export for external consumers; no UI wrapper by design. */
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface StatCardRootProps extends HTMLAttributes<HTMLDivElement> {
	tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
	density?: 'comfortable' | 'compact';
	children: Snippet;
}

export interface StatCardLabelProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface StatCardValueProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface StatCardTrendProps extends HTMLAttributes<HTMLDivElement> {
	direction?: 'up' | 'down' | 'flat';
	children: Snippet;
}

import StatCardRoot from './stat-card-root.svelte';
import StatCardLabel from './stat-card-label.svelte';
import StatCardValue from './stat-card-value.svelte';
import StatCardTrend from './stat-card-trend.svelte';

export const StatCard: {
	Root: typeof StatCardRoot;
	Label: typeof StatCardLabel;
	Value: typeof StatCardValue;
	Trend: typeof StatCardTrend;
} = {
	Root: StatCardRoot,
	Label: StatCardLabel,
	Value: StatCardValue,
	Trend: StatCardTrend
};
