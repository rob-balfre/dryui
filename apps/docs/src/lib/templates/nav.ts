import { createNavFinder } from '$lib/utils/nav-utils';

export interface TemplateEntry {
	name: string;
	slug: string;
	description: string;
	audience: string;
	demoFile: string;
	demoSlug: string;
}

export const templates: TemplateEntry[] = [
	{
		name: 'Dashboard Starter',
		slug: 'dashboard-starter',
		description: 'KPI cards, tables, tabs, and progress patterns for internal tools.',
		audience: 'Analytics and operations surfaces',
		demoFile: 'DashboardDemo.svelte',
		demoSlug: 'dashboard'
	},
	{
		name: 'App Shell Starter',
		slug: 'app-shell-starter',
		description: 'Responsive layout primitives for navigation-heavy product shells.',
		audience: 'Backoffice and SaaS applications',
		demoFile: 'LayoutDemo.svelte',
		demoSlug: 'layout'
	},
	{
		name: 'Advanced Forms Starter',
		slug: 'advanced-forms-starter',
		description: 'Field-heavy forms with grouped controls and validation-oriented structure.',
		audience: 'Settings, onboarding, and workflow screens',
		demoFile: 'AdvancedFormsDemo.svelte',
		demoSlug: 'advanced-forms'
	},
	{
		name: 'Hotel Search Starter',
		slug: 'hotel-search-starter',
		description: 'Search-first landing surface with filters, cards, and booking-style UI.',
		audience: 'Discovery and marketing-oriented experiences',
		demoFile: 'HotelSearchDemo.svelte',
		demoSlug: 'hotel-search'
	}
];

export const findTemplate = createNavFinder(templates, (t, slug) => t.slug === slug);
