export type { FieldRootProps, FieldDescriptionProps, FieldErrorProps } from '@dryui/primitives';

import FieldRoot from './field-root.svelte';
import FieldDescription from './field-description.svelte';
import FieldError from './field-error.svelte';

export const Field: {
	Root: typeof FieldRoot;
	Description: typeof FieldDescription;
	Error: typeof FieldError;
} = {
	Root: FieldRoot,
	Description: FieldDescription,
	Error: FieldError
};
