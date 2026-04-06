import type { AnnotationColor, FeedbackSettings } from './types.js';

export interface AnnotationColorOption {
	readonly value: AnnotationColor;
	readonly label: string;
	readonly swatch: string;
}

export const DEFAULT_SETTINGS: FeedbackSettings = {
	outputDetail: 'standard',
	autoClearAfterCopy: false,
	annotationColor: 'brand',
	blockInteractions: true,
	svelteDetection: true,
	markerClickBehavior: 'edit',
	theme: 'dark',
	webhookUrl: '',
	webhooksEnabled: true
};

export const ANNOTATION_COLOR_OPTIONS: AnnotationColorOption[] = [
	{ value: 'brand', label: 'Brand', swatch: 'var(--dry-color-fill-brand, #4f46e5)' },
	{ value: 'info', label: 'Info', swatch: 'var(--dry-color-fill-info, #0ea5e9)' },
	{ value: 'success', label: 'Success', swatch: 'var(--dry-color-fill-success, #16a34a)' },
	{ value: 'warning', label: 'Warning', swatch: 'var(--dry-color-fill-warning, #d97706)' },
	{ value: 'error', label: 'Error', swatch: 'var(--dry-color-fill-error, #dc2626)' },
	{ value: 'neutral', label: 'Neutral', swatch: 'var(--dry-color-fill, #6b7280)' }
];

const LEGACY_ANNOTATION_COLOR_MAP = {
	indigo: 'brand',
	blue: 'info',
	cyan: 'info',
	green: 'success',
	yellow: 'warning',
	orange: 'warning',
	red: 'error'
} as const;

export function normalizeAnnotationColor(color: string | null | undefined): AnnotationColor {
	if (!color) return DEFAULT_SETTINGS.annotationColor;
	if (color in LEGACY_ANNOTATION_COLOR_MAP) {
		return LEGACY_ANNOTATION_COLOR_MAP[color as keyof typeof LEGACY_ANNOTATION_COLOR_MAP];
	}

	return (
		ANNOTATION_COLOR_OPTIONS.find((option) => option.value === color)?.value ??
		DEFAULT_SETTINGS.annotationColor
	);
}
