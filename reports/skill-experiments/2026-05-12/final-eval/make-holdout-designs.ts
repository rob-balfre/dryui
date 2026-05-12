import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const outDir = resolve(import.meta.dir, 'design-references');
mkdirSync(outDir, { recursive: true });

const designs = [
	{
		id: 'calendar-ops',
		title: 'Ops Calendar',
		accent: '#2563eb',
		sidebar: ['Today', 'Schedule', 'Rooms', 'Teams', 'Reports'],
		metric: ['42 bookings', '11 rooms', '86% capacity'],
		mainTitle: 'Weekly room plan',
		rows: ['Design sync', 'Launch review', 'Hiring panel', 'Partner demo'],
		aside: ['Conflict watch', 'AV requests', 'Catering']
	},
	{
		id: 'inventory-admin',
		title: 'Inventory',
		accent: '#16a34a',
		sidebar: ['Overview', 'Stock', 'Orders', 'Suppliers', 'Returns'],
		metric: ['18 low stock', '4.8k units', '92% fill rate'],
		mainTitle: 'Stock movement',
		rows: ['Trail runners', 'Canvas tote', 'Rain shell', 'Insulated flask'],
		aside: ['Reorder queue', 'Supplier health', 'Quality holds']
	},
	{
		id: 'support-inbox',
		title: 'Support Desk',
		accent: '#7c3aed',
		sidebar: ['Inbox', 'Priority', 'Agents', 'Macros', 'Insights'],
		metric: ['128 open', '14 urgent', '2h SLA'],
		mainTitle: 'Priority conversations',
		rows: [
			'Billing export failed',
			'Cannot invite teammate',
			'Refund not received',
			'API key rotated'
		],
		aside: ['Agent load', 'Suggested macro', 'Escalations']
	},
	{
		id: 'finance-planning',
		title: 'Budget Plan',
		accent: '#0891b2',
		sidebar: ['Plan', 'Actuals', 'Forecast', 'Vendors', 'Approvals'],
		metric: ['$1.2M spend', '7% variance', '18 approvals'],
		mainTitle: 'Department forecast',
		rows: ['Product hiring', 'Cloud services', 'Events', 'Contractors'],
		aside: ['Approval queue', 'Risk notes', 'Savings']
	},
	{
		id: 'course-portal',
		title: 'Course Hub',
		accent: '#ea580c',
		sidebar: ['Lessons', 'Cohorts', 'Progress', 'Library', 'Messages'],
		metric: ['312 learners', '74% active', '9 tasks due'],
		mainTitle: 'Cohort progress',
		rows: ['Research brief', 'Prototype review', 'Critique notes', 'Final project'],
		aside: ['Upcoming live', 'At risk learners', 'Resource picks']
	}
];

function htmlFor(design: (typeof designs)[number]): string {
	const metricCards = design.metric
		.map(
			(item) =>
				`<article class="metric"><span>${item.split(' ')[0]}</span><p>${item.split(' ').slice(1).join(' ')}</p></article>`
		)
		.join('');
	const nav = design.sidebar
		.map((item, index) => `<div class="nav ${index === 1 ? 'active' : ''}">${item}</div>`)
		.join('');
	const rows = design.rows
		.map(
			(item, index) =>
				`<div class="row"><div><strong>${item}</strong><p>${index % 2 ? 'Owner review due today' : 'Updated by Morgan Lee'}</p></div><span>${index + 2}h</span></div>`
		)
		.join('');
	const aside = design.aside
		.map(
			(item, index) =>
				`<article class="aside-card"><strong>${item}</strong><p>${index === 0 ? 'Needs attention before 3pm' : 'Healthy trend this week'}</p></article>`
		)
		.join('');
	return `<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		* { box-sizing: border-box; }
		body {
			margin: 0;
			width: 1536px;
			height: 1024px;
			font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			background: #e8eef6;
			color: #111827;
		}
		.shell {
			display: grid;
			grid-template-columns: 260px minmax(0, 1fr) 320px;
			grid-template-rows: 96px minmax(0, 1fr);
			gap: 16px;
			height: 100%;
			padding: 24px;
		}
		.navpane, .topbar, .main, .aside { background: #fff; border: 1px solid #cbd5e1; border-radius: 18px; box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08); }
		.navpane { grid-row: 1 / 3; padding: 22px; }
		.brand { display: flex; align-items: center; gap: 12px; font-size: 28px; font-weight: 800; margin-bottom: 28px; }
		.logo { width: 38px; height: 38px; border-radius: 12px; background: ${design.accent}; }
		.nav { padding: 14px 16px; margin-bottom: 10px; border-radius: 12px; font-weight: 650; color: #475569; }
		.nav.active { color: #fff; background: ${design.accent}; }
		.topbar { grid-column: 2 / 4; display: flex; align-items: center; justify-content: space-between; padding: 20px 26px; }
		h1 { margin: 0; font-size: 34px; letter-spacing: 0; }
		.actions { display: flex; gap: 12px; align-items: center; }
		.pill { border: 1px solid #cbd5e1; border-radius: 999px; padding: 12px 16px; background: #f8fafc; font-weight: 700; }
		.primary { background: ${design.accent}; color: #fff; }
		.main { padding: 24px; overflow: hidden; }
		.metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 18px; }
		.metric { background: #f8fafc; border: 1px solid #dbe3ee; border-radius: 14px; padding: 18px; }
		.metric span { display: block; font-size: 32px; font-weight: 800; color: ${design.accent}; }
		.metric p { margin: 6px 0 0; color: #475569; font-weight: 650; }
		.board { border: 1px solid #dbe3ee; border-radius: 16px; overflow: hidden; }
		.board-head { padding: 20px; background: #f8fafc; display: flex; align-items: center; justify-content: space-between; }
		h2 { margin: 0; font-size: 28px; }
		.row { display: flex; justify-content: space-between; gap: 16px; align-items: center; padding: 18px 20px; border-top: 1px solid #e2e8f0; }
		.row strong { font-size: 20px; }
		.row p, .aside-card p { margin: 6px 0 0; color: #64748b; }
		.row span { color: ${design.accent}; background: #eef6ff; border-radius: 999px; padding: 8px 12px; font-weight: 800; }
		.aside { padding: 24px; }
		.aside-card { padding: 18px; border: 1px solid #dbe3ee; border-radius: 14px; background: #f8fafc; margin-bottom: 14px; }
		.aside-card:first-of-type { background: color-mix(in srgb, ${design.accent} 12%, white); border-color: color-mix(in srgb, ${design.accent} 30%, white); }
	</style>
</head>
<body>
	<div class="shell">
		<aside class="navpane"><div class="brand"><span class="logo"></span>${design.title}</div>${nav}</aside>
		<header class="topbar"><h1>${design.title}</h1><div class="actions"><span class="pill">May 2026</span><span class="pill primary">Create</span></div></header>
		<main class="main"><section class="metrics">${metricCards}</section><section class="board"><div class="board-head"><h2>${design.mainTitle}</h2><span class="pill">Live</span></div>${rows}</section></main>
		<aside class="aside">${aside}</aside>
	</div>
</body>
</html>`;
}

const browser = await chromium.launch();
try {
	const page = await browser.newPage({
		viewport: { width: 1536, height: 1024 },
		deviceScaleFactor: 1
	});
	for (const design of designs) {
		const html = htmlFor(design);
		const htmlPath = resolve(outDir, `${design.id}.html`);
		const pngPath = resolve(outDir, `${design.id}.png`);
		writeFileSync(htmlPath, html);
		await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
		await page.screenshot({ path: pngPath, fullPage: false });
		console.log(pngPath);
	}
	await page.close();
} finally {
	await browser.close();
}
