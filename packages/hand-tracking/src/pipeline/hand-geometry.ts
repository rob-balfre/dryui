import type { Point3D } from '../types.js';
import type { Point2D, Contour } from './contour.js';
import { convexHull, convexityDefects } from './convex-hull.js';

export interface HandGeometry {
	contour: Contour;
	hull: Point2D[];
	defects: ReturnType<typeof convexityDefects>;
	fingertips: Point3D[];
	maximaCount: number;
	fingertipSource: 'maxima' | 'fallback';
	palmCenter: Point3D;
	wrist: Point3D;
	skeleton: Point3D[];
}

function mean(points: Point2D[]): Point2D {
	if (points.length === 0) {
		return { x: 0, y: 0 };
	}

	let sumX = 0;
	let sumY = 0;
	for (const point of points) {
		sumX += point.x;
		sumY += point.y;
	}

	return {
		x: sumX / points.length,
		y: sumY / points.length
	};
}

function distance(a: Point2D, b: Point2D): number {
	return Math.hypot(a.x - b.x, a.y - b.y);
}

function localMaxima(points: Point2D[]): Point2D[] {
	if (points.length < 3) {
		return [...points];
	}

	const center = mean(points);
	const radii = points.map((point) => distance(point, center));
	const average = radii.reduce((total, value) => total + value, 0) / radii.length;
	const spread = Math.sqrt(
		radii.reduce((total, value) => total + (value - average) ** 2, 0) / radii.length
	);
	const threshold = average + spread * 0.2;
	const maxima: { point: Point2D; radius: number; angle: number }[] = [];

	for (let index = 0; index < points.length; index += 1) {
		const previous = radii[(index - 1 + radii.length) % radii.length]!;
		const current = radii[index]!;
		const next = radii[(index + 1) % radii.length]!;

		if (current >= previous && current >= next && current >= threshold) {
			maxima.push({
				point: points[index]!,
				radius: current,
				angle: Math.atan2(points[index]!.y - center.y, points[index]!.x - center.x)
			});
		}
	}

	const selected: typeof maxima = [];
	const minSeparation = Math.PI / 8;

	for (const candidate of maxima.sort((a, b) => b.radius - a.radius)) {
		if (
			selected.every((item) => {
				const delta = Math.abs(item.angle - candidate.angle);
				return delta >= minSeparation && Math.abs(delta - Math.PI * 2) >= minSeparation;
			})
		) {
			selected.push(candidate);
		}
		if (selected.length === 5) {
			break;
		}
	}

	return selected.map((candidate) => candidate.point).sort((a, b) => a.x - b.x);
}

function fallbackFingertips(contour: Contour): Point3D[] {
	const bucketCount = 5;
	const bucketWidth = contour.bounds.width / bucketCount;
	const scanlineLimit = contour.bounds.y + contour.bounds.height * 0.62;
	const fingertips: Point3D[] = [];

	for (let bucket = 0; bucket < bucketCount; bucket += 1) {
		const minX = contour.bounds.x + bucket * bucketWidth;
		const maxX = contour.bounds.x + (bucket + 1) * bucketWidth;
		const candidates = contour.points.filter(
			(point) => point.x >= minX && point.x < maxX && point.y <= scanlineLimit
		);

		if (candidates.length > 0) {
			const topmost = candidates.reduce((best, point) => (point.y < best.y ? point : best));
			fingertips.push({ x: topmost.x, y: topmost.y, z: 0 });
			continue;
		}

		fingertips.push({
			x: contour.bounds.x + bucketWidth * (bucket + 0.5),
			y: contour.bounds.y + contour.bounds.height * 0.18,
			z: 0
		});
	}

	return fingertips;
}

function fingertipToSkeleton(
	wrist: Point3D,
	fingertips: Point3D[],
	fallbackPalm: Point3D
): Point3D[] {
	const skeleton: Point3D[] = [wrist];
	const ordered = [...fingertips].sort((a, b) => a.x - b.x);

	while (ordered.length < 5) {
		ordered.push({
			x: fallbackPalm.x,
			y: fallbackPalm.y - (5 - ordered.length) * 8,
			z: 0
		});
	}

	for (const fingertip of ordered.slice(0, 5)) {
		for (let joint = 1; joint <= 4; joint += 1) {
			const t = joint / 4;
			skeleton.push({
				x: wrist.x + (fingertip.x - wrist.x) * t,
				y: wrist.y + (fingertip.y - wrist.y) * t,
				z: wrist.z + (fingertip.z - wrist.z) * t
			});
		}
	}

	return skeleton.slice(0, 21);
}

export function analyzeHandContour(contour: Contour): HandGeometry {
	const center = contour.centroid;
	const hull = convexHull(contour.points);
	const defects = convexityDefects(contour.points, hull);
	const maxima = localMaxima(contour.points);
	const fingertipSource = maxima.length >= 4 ? 'maxima' : 'fallback';
	const fingertips =
		fingertipSource === 'maxima'
			? maxima.slice(0, 5).map((point) => ({ x: point.x, y: point.y, z: 0 }))
			: fallbackFingertips(contour);
	const wristPoint = {
		x: contour.bounds.x + contour.bounds.width / 2,
		y: contour.bounds.y + contour.bounds.height,
		z: 0
	};

	return {
		contour,
		hull,
		defects,
		fingertips,
		maximaCount: maxima.length,
		fingertipSource,
		palmCenter: {
			x: center.x,
			y: center.y,
			z: 0
		},
		wrist: wristPoint,
		skeleton: fingertipToSkeleton(wristPoint, fingertips, {
			x: center.x,
			y: center.y,
			z: 0
		})
	};
}
