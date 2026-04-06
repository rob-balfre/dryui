import {
	decodeStudioMessage,
	encodeStudioMessage,
	type StudioClientMessage,
	type StudioServerMessage
} from '@dryui/studio-server/protocol';
import type { ChatConnectionStatus } from './chat-store.svelte';

export interface StudioWsClientOptions {
	url?: string;
	onMessage?: (message: StudioServerMessage) => void;
	onStatusChange?: (status: ChatConnectionStatus) => void;
	webSocketFactory?: (url: string) => WebSocket;
}

export interface StudioWsClient {
	readonly status: ChatConnectionStatus;
	connect(): void;
	disconnect(code?: number, reason?: string): void;
	send(message: StudioClientMessage): void;
}

function defaultStudioUrl(): string | null {
	if (typeof window === 'undefined') {
		return null;
	}

	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	return `${protocol}//${window.location.hostname}:8788/ws`;
}

export function createStudioWsClient(options: StudioWsClientOptions = {}): StudioWsClient {
	let status: ChatConnectionStatus = 'local';
	let socket: WebSocket | null = null;

	const updateStatus = (next: ChatConnectionStatus) => {
		status = next;
		options.onStatusChange?.(next);
	};

	return {
		get status() {
			return status;
		},

		connect() {
			const url = options.url ?? defaultStudioUrl();
			if (!url || typeof WebSocket === 'undefined') {
				updateStatus('local');
				return;
			}

			updateStatus('connecting');
			socket = (options.webSocketFactory ?? ((target) => new WebSocket(target)))(url);
			socket.onopen = () => {
				updateStatus('connected');
			};
			socket.onmessage = (event) => {
				options.onMessage?.(decodeStudioMessage(event.data) as StudioServerMessage);
			};
			socket.onerror = () => {
				updateStatus('error');
			};
			socket.onclose = () => {
				updateStatus('local');
				socket = null;
			};
		},

		disconnect(code, reason) {
			socket?.close(code, reason);
			socket = null;
			updateStatus('local');
		},

		send(message) {
			if (socket?.readyState === WebSocket.OPEN) {
				socket.send(encodeStudioMessage(message));
			}
		}
	};
}
