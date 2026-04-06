import type { WizardClientMessage, WizardConnectionStatus, WizardServerMessage } from './types';

export interface WizardWsClientOptions {
	url?: string;
	onMessage?: (message: WizardServerMessage) => void;
	onStatusChange?: (status: WizardConnectionStatus) => void;
	webSocketFactory?: (url: string) => WebSocket;
}

export interface WizardWsClient {
	readonly status: WizardConnectionStatus;
	connect(): void;
	disconnect(code?: number, reason?: string): void;
	send(message: WizardClientMessage): void;
}

function defaultWizardUrl(): string | null {
	if (typeof window === 'undefined') {
		return null;
	}

	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	return `${protocol}//${window.location.host}/ws`;
}

export function createWizardWsClient(options: WizardWsClientOptions = {}): WizardWsClient {
	let status: WizardConnectionStatus = 'local';
	let socket: WebSocket | null = null;

	const updateStatus = (next: WizardConnectionStatus) => {
		status = next;
		options.onStatusChange?.(next);
	};

	return {
		get status() {
			return status;
		},

		connect() {
			const url = options.url ?? defaultWizardUrl();
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
				options.onMessage?.(JSON.parse(String(event.data)) as WizardServerMessage);
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
				socket.send(JSON.stringify(message));
			}
		}
	};
}
