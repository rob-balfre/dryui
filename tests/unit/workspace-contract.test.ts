import { expect, test } from 'bun:test';

interface WorkspacePackageJson {
	scripts: Record<string, string>;
	devDependencies: Record<string, string>;
}

async function parsePackageJson(path: URL): Promise<WorkspacePackageJson> {
	const raw: unknown = JSON.parse(await Bun.file(path).text());
	if (
		typeof raw !== 'object' ||
		raw === null ||
		!('scripts' in raw) ||
		!('devDependencies' in raw)
	) {
		throw new Error('package.json missing expected fields');
	}
	return raw as WorkspacePackageJson;
}

const packageJson = await parsePackageJson(new URL('../../package.json', import.meta.url));
const validateWorkflow = await Bun.file(
	new URL('../../.github/workflows/validate.yml', import.meta.url)
).text();
const docsVisualConfig = await Bun.file(
	new URL('../../playwright.docs.config.ts', import.meta.url)
).text();
const docsVisualSpec = await Bun.file(
	new URL('../../tests/playwright/docs-visual.spec.ts', import.meta.url)
).text();
const testUnitScript = await Bun.file(
	new URL('../../scripts/test-unit.ts', import.meta.url)
).text();
const validateScript = await Bun.file(new URL('../../scripts/validate.ts', import.meta.url)).text();

test('unit test contract points at the local unit suite', () => {
	expect(packageJson.scripts['test:unit']).toBe('bun run ./scripts/test-unit.ts');
});

test('unit suite includes the stable package-local tests that feed coverage', () => {
	expect(testUnitScript).toContain('tests/unit/**/*.test.ts');
	expect(testUnitScript).toContain('packages/cli/src/__tests__/*.test.ts');
	expect(testUnitScript).toContain('packages/feedback-server/tests/**/*.test.ts');
	expect(testUnitScript).toContain('packages/lint/src/*.test.ts');
	expect(testUnitScript).toContain('packages/mcp/src/**/*.test.ts');
	expect(testUnitScript).toContain('packages/theme-wizard/src/engine/*.test.ts');
});

test('browser test contract is configured for Vitest browser mode', () => {
	expect(packageJson.scripts['test:browser']).toBe('vitest --browser --run tests/browser');
	expect(packageJson.devDependencies.vitest).toBeDefined();
	expect(packageJson.devDependencies['@vitest/browser-playwright']).toBeDefined();
	expect(packageJson.devDependencies['@vitest/coverage-v8']).toBeDefined();
	expect(packageJson.devDependencies.playwright).toBeDefined();
	expect(packageJson.devDependencies.svelte).toBeDefined();
});

test('coverage scripts are available for unit and browser suites', () => {
	expect(packageJson.scripts['test:coverage:unit']).toBe(
		'bun run ./scripts/test-unit.ts --coverage --coverage-reporter=text --coverage-reporter=lcov --coverage-dir=coverage/unit'
	);
	expect(packageJson.scripts['test:coverage:browser']).toBe(
		'vitest --browser --run --coverage --coverage.provider=v8 --coverage.reportsDirectory=coverage/browser --coverage.reporter=text --coverage.reporter=html --coverage.reporter=json-summary tests/browser'
	);
	expect(packageJson.scripts['test:coverage']).toBe(
		'bun run test:coverage:unit && bun run test:coverage:browser && bun run coverage:summary'
	);
	expect(packageJson.scripts['coverage:summary']).toBe('bun run ./scripts/coverage-summary.ts');
	expect(packageJson.scripts['coverage:check']).toBe(
		'bun run ./scripts/check-coverage-baseline.ts'
	);
	expect(packageJson.scripts['coverage:matrix']).toBe(
		'bun run ./scripts/generate-component-coverage-matrix.ts'
	);
	expect(packageJson.scripts['check:interactive-coverage']).toBe(
		'bun run ./scripts/check-interactive-coverage.ts'
	);
});

test('release scripts require validation before publish', () => {
	expect(packageJson.scripts['clean:package-src-declarations']).toBe(
		'bun run scripts/check-generated-files.ts --clean-package-src-declarations'
	);
	expect(packageJson.scripts['check:package-src-declarations']).toBe(
		'bun run scripts/check-generated-files.ts --check-package-src-declarations'
	);
	expect(packageJson.scripts.check).toContain('check:packages');
	expect(packageJson.scripts.check).toContain('check:docs');
	expect(packageJson.scripts.check).toContain('check:mcp');
	expect(packageJson.scripts.check).toContain('check:package-src-declarations');
	expect(packageJson.scripts.check).toContain('check:architecture');
	expect(packageJson.scripts.check).toContain('check:lint:violations');
	expect(packageJson.scripts['check:architecture']).toBe(
		"bun run scripts/check-generated-files.ts \"bun run --filter '@dryui/mcp' generate-spec && bun run --filter '@dryui/mcp' generate-architecture\" packages/mcp/src/spec.json packages/mcp/src/architecture.json"
	);
	expect(packageJson.scripts.build).toBe('bun run build:packages && bun run build:docs');
	const buildPackages = packageJson.scripts['build:packages'];
	expect(buildPackages).toContain('bun run clean:package-src-declarations');
	const requiredPackages = [
		'@dryui/lint',
		'@dryui/primitives',
		'@dryui/ui',
		'@dryui/feedback',
		'@dryui/theme-wizard',
		'@dryui/mcp',
		'@dryui/feedback-server',
		'@dryui/cli'
	];
	for (const pkg of requiredPackages) {
		expect(buildPackages).toContain(`--filter '${pkg}' build`);
	}
	expect(packageJson.scripts.validate).toBe('bun run ./scripts/validate.ts');
	expect(packageJson.scripts['release:gate']).toBe('bun run validate --no-test');
	expect(validateScript).toContain("run('check:lint:violations', 'bun run check:lint:violations')");
	expect(validateScript).toContain("await run('check:architecture', 'bun run check:architecture')");
	expect(validateScript).toContain(
		"await run('clean:package-src-declarations', 'bun run clean:package-src-declarations')"
	);
});

test('CI workflow runs a dedicated coverage lane and uploads retained artifacts', () => {
	expect(validateWorkflow).toContain('coverage:');
	expect(validateWorkflow).toContain('- run: bun --bun playwright install chromium');
	expect(validateWorkflow).toContain('- run: bun run test:coverage');
	expect(validateWorkflow).toContain('- run: bun run coverage:check');
	expect(validateWorkflow).toContain('- run: bun run coverage:matrix');
	expect(validateWorkflow).toContain('name: coverage-${{ github.sha }}');
	expect(validateWorkflow).toContain('coverage/summary');
	expect(validateWorkflow).toContain('coverage/unit');
	expect(validateWorkflow).toContain('coverage/browser');
	expect(validateWorkflow).toContain('reports/component-coverage-matrix.json');
	expect(validateWorkflow).toContain('reports/component-coverage-matrix.md');
	expect(validateWorkflow).toContain('DRYUI_BASE_REF: origin/${{ github.base_ref }}');
	expect(validateWorkflow).toContain('DRYUI_PR_BODY: ${{ github.event.pull_request.body }}');
	expect(validateWorkflow).toContain('retention-days: 14');
});

test('docs visual suite stays runnable locally', () => {
	expect(packageJson.scripts['test:docs-visual']).toBe(
		'bun --bun playwright test -c playwright.docs.config.ts'
	);
	expect(packageJson.scripts['test:docs-visual:update']).toBe(
		'bun --bun playwright test -c playwright.docs.config.ts --update-snapshots'
	);
	expect(docsVisualConfig).toContain("command: 'bun --bun vite dev --host 127.0.0.1 --port 4173'");
	expect(docsVisualConfig).toContain('fullyParallel: true');
	expect(docsVisualConfig).not.toContain('workers: 1');
	expect(docsVisualSpec).not.toContain("mode: 'serial'");
	expect(docsVisualConfig).toContain("browserName: 'chromium'");
	expect(docsVisualConfig).toContain('headless: true');
});
