import type {
	FloatButtonRootProps as PrimitiveFloatButtonRootProps,
	FloatButtonTriggerProps as PrimitiveFloatButtonTriggerProps,
	FloatButtonActionProps
} from '@dryui/primitives';

export type { FloatButtonActionProps };

export interface FloatButtonRootProps extends PrimitiveFloatButtonRootProps {
	position?: 'bottom-right' | 'bottom-left';
}

export interface FloatButtonTriggerProps extends PrimitiveFloatButtonTriggerProps {
	size?: 'sm' | 'md' | 'lg';
}

import FloatButtonRoot from './float-button-root.svelte';
import FloatButtonTrigger from './float-button-trigger.svelte';
import FloatButtonAction from './float-button-action.svelte';

export const FloatButton: {
	Root: typeof FloatButtonRoot;
	Trigger: typeof FloatButtonTrigger;
	Action: typeof FloatButtonAction;
} = {
	Root: FloatButtonRoot,
	Trigger: FloatButtonTrigger,
	Action: FloatButtonAction
};
