import type { ScenarioDefinition } from '../../../scripts/e2e/scenario-harness.ts';
import { dashboardScenario } from './dashboard.ts';
import { shoppingScenario } from './shopping.ts';
import { travelScenario } from './travel.ts';

export const SCENARIOS: readonly ScenarioDefinition[] = [
	dashboardScenario,
	travelScenario,
	shoppingScenario
];

export function findScenario(name: string): ScenarioDefinition | undefined {
	return SCENARIOS.find((s) => s.name === name);
}
