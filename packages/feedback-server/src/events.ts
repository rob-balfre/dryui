import type { SSEEvent } from './types.js';

export interface EventSubscriberOptions {
	agent?: boolean;
	matches?(event: SSEEvent): boolean;
}

interface Subscriber {
	listener(event: SSEEvent): void;
	agent: boolean;
	matches?(event: SSEEvent): boolean;
}

export class EventBus {
	#subscribers = new Set<Subscriber>();

	subscribe(listener: (event: SSEEvent) => void, options: EventSubscriberOptions = {}): () => void {
		const subscriber: Subscriber = {
			listener,
			agent: options.agent ?? false,
			...(options.matches ? { matches: options.matches } : {})
		};
		this.#subscribers.add(subscriber);

		return () => {
			this.#subscribers.delete(subscriber);
		};
	}

	emit(event: SSEEvent): { activeListeners: number; agentListeners: number } {
		let activeListeners = 0;
		let agentListeners = 0;

		for (const subscriber of this.#subscribers) {
			if (subscriber.matches && !subscriber.matches(event)) {
				continue;
			}

			subscriber.listener(event);
			activeListeners += 1;
			if (subscriber.agent) {
				agentListeners += 1;
			}
		}

		return {
			activeListeners,
			agentListeners
		};
	}

	counts(): { activeListeners: number; agentListeners: number } {
		let agentListeners = 0;
		for (const subscriber of this.#subscribers) {
			if (subscriber.agent) {
				agentListeners += 1;
			}
		}

		return {
			activeListeners: this.#subscribers.size,
			agentListeners
		};
	}
}
