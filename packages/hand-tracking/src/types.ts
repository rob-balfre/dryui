export interface Point3D {
	x: number;
	y: number;
	z: number;
}

export interface Bounds2D {
	x: number;
	y: number;
	width: number;
	height: number;
}

export type GestureType =
	| 'hover'
	| 'pinch'
	| 'drag'
	| 'resize'
	| 'two-hand-pinch'
	| 'open-palm'
	| 'point'
	| 'fist'
	| 'swipe'
	| 'finger-count';

export interface HandLandmarks {
	id: string;
	points: Point3D[];
	handedness: 'left' | 'right' | 'unknown';
	confidence: number;
	boundingBox: Bounds2D;
	centroid: Point3D;
	palmCenter: Point3D;
	wrist: Point3D;
	timestamp?: number;
}

export interface GestureEvent {
	type: GestureType;
	handId: string | null;
	handIndex: number;
	confidence: number;
	cursor: Point3D | null;
	details: Record<string, number | boolean | string | null>;
}

export interface CalibrationProfile {
	sampleCount: number;
	confidence: number;
	yRange: [number, number];
	cbRange: [number, number];
	crRange: [number, number];
	mean: {
		y: number;
		cb: number;
		cr: number;
	};
	deviation: {
		y: number;
		cb: number;
		cr: number;
	};
	stable: boolean;
}
