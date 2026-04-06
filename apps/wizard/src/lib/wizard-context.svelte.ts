import { getContext, setContext } from 'svelte';
import type { WizardController } from './wizard-state.svelte';

const WIZARD_CONTROLLER_KEY = Symbol('wizard-controller');

export function setWizardController(controller: WizardController): void {
	setContext(WIZARD_CONTROLLER_KEY, controller);
}

export function getWizardController(): WizardController {
	return getContext(WIZARD_CONTROLLER_KEY) as WizardController;
}
