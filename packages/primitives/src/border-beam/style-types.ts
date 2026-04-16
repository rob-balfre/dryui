export type BorderBeamColorVariant = 'colorful' | 'mono' | 'ocean' | 'sunset';

export interface SizeConfig {
	borderRadius: number;
	borderWidth: number;
	width?: number;
	height?: number;
}

export interface ThemeColors {
	strokeOpacity: number;
	innerOpacity: number;
	bloomOpacity: number;
	innerShadow: string;
	saturation: number;
}
