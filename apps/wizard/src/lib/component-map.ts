import {
	Badge,
	Button,
	Checkbox,
	Container,
	Heading,
	Input,
	ScrollArea,
	Separator,
	Text
} from '@dryui/ui';

export const componentMap = {
	Badge,
	Button,
	Checkbox,
	Container,
	Heading,
	Input,
	ScrollArea,
	Separator,
	Text
} as const;

export type WizardPreviewComponentName = keyof typeof componentMap;

export const previewableComponentNames = Object.keys(componentMap) as WizardPreviewComponentName[];
