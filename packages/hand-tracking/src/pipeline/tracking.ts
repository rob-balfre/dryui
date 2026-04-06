import type { HandLandmarks, Point3D } from '../types.js';

export interface TrackedHand extends HandLandmarks {
	trackingScore: number;
	previousId?: string;
}

function centroidDistance(a: HandLandmarks, b: HandLandmarks): number {
	return Math.hypot(a.centroid.x - b.centroid.x, a.centroid.y - b.centroid.y);
}

function fitScore(previous: HandLandmarks, current: HandLandmarks): number {
	const centroidScore = 1 / (1 + centroidDistance(previous, current));
	const handednessScore = previous.handedness === current.handedness ? 1 : 0.75;
	return centroidScore * handednessScore;
}

export function assignTrackedHands(
	previous: HandLandmarks[],
	current: HandLandmarks[]
): TrackedHand[] {
	const used = new Set<number>();

	return current.map((hand, index) => {
		let bestMatch = -1;
		let bestScore = -1;

		for (let previousIndex = 0; previousIndex < previous.length; previousIndex += 1) {
			if (used.has(previousIndex)) continue;
			const score = fitScore(previous[previousIndex]!, hand);
			if (score > bestScore) {
				bestScore = score;
				bestMatch = previousIndex;
			}
		}

		const matched = bestMatch >= 0 ? previous[bestMatch] : null;
		if (matched && bestMatch >= 0) {
			used.add(bestMatch);
		}

		return {
			...hand,
			id: matched?.id ?? hand.id ?? `hand-${index}`,
			trackingScore: bestScore > 0 ? bestScore : 0,
			...(matched?.id ? { previousId: matched.id } : {})
		};
	});
}

export function estimateCursor(hand: HandLandmarks): Point3D {
	return {
		x: hand.palmCenter.x,
		y: hand.palmCenter.y,
		z: hand.palmCenter.z
	};
}
