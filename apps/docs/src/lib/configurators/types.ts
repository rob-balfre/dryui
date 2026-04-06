export type ConfigValue = string | number | boolean;

export interface ConfigOption {
	label: string;
	value: string;
}

interface ConfigControlBase<Type extends string, Value extends ConfigValue> {
	key: string;
	label: string;
	type: Type;
	defaultValue: Value;
	description?: string;
}

export interface SelectControl extends ConfigControlBase<'select', string> {
	options: readonly ConfigOption[];
}

export interface BooleanControl extends ConfigControlBase<'boolean', boolean> {}

export interface TextControl extends ConfigControlBase<'text', string> {
	placeholder?: string;
}

export interface NumberControl extends ConfigControlBase<'number', number> {
	min?: number;
	max?: number;
	step?: number;
}

export type ConfigControl = SelectControl | BooleanControl | TextControl | NumberControl;

export type ConfigValues = Record<string, ConfigValue>;

export function createConfiguratorState(controls: readonly ConfigControl[]): ConfigValues {
	return Object.fromEntries(controls.map((control) => [control.key, control.defaultValue]));
}
