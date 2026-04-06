import type { CanvasCommand } from '@dryui/canvas';
import type { ChatMessage } from '../studio-data';

export type ChatConnectionStatus = 'local' | 'connecting' | 'connected' | 'error';
export type CommandPreviewMode = 'commands' | 'undo' | 'redo';

export interface StudioCommandPreview {
	id: string;
	prompt: string;
	summary: string;
	assistantMessage: string;
	lines: string[];
	commands: CanvasCommand[];
	mode: CommandPreviewMode;
}

export interface ChatStoreSnapshot {
	messages: ChatMessage[];
	preview: StudioCommandPreview | null;
	status: ChatConnectionStatus;
}

type ChatStoreListener = (snapshot: ChatStoreSnapshot) => void;

export class ChatStore {
	#listeners = new Set<ChatStoreListener>();
	#messages: ChatMessage[];
	#preview: StudioCommandPreview | null = null;
	#status: ChatConnectionStatus = 'local';

	constructor(initialMessages: ChatMessage[] = []) {
		this.#messages = [...initialMessages];
	}

	get preview(): StudioCommandPreview | null {
		return this.#preview;
	}

	subscribe(listener: ChatStoreListener): () => void {
		this.#listeners.add(listener);
		listener(this.snapshot());
		return () => {
			this.#listeners.delete(listener);
		};
	}

	snapshot(): ChatStoreSnapshot {
		return {
			messages: [...this.#messages],
			preview: this.#preview,
			status: this.#status
		};
	}

	setStatus(status: ChatConnectionStatus): void {
		this.#status = status;
		this.#emit();
	}

	appendUser(content: string): ChatMessage {
		const message = this.#createMessage('user', content);
		this.#messages = [...this.#messages, message];
		this.#emit();
		return message;
	}

	appendAssistant(content: string): ChatMessage {
		const message = this.#createMessage('assistant', content);
		this.#messages = [...this.#messages, message];
		this.#emit();
		return message;
	}

	setPreview(preview: StudioCommandPreview | null): void {
		this.#preview = preview;
		this.#emit();
	}

	clearPreview(): void {
		this.#preview = null;
		this.#emit();
	}

	#createMessage(role: ChatMessage['role'], content: string): ChatMessage {
		return {
			id: `msg-${this.#messages.length + 1}`,
			role,
			content
		};
	}

	#emit(): void {
		const snapshot = this.snapshot();
		for (const listener of this.#listeners) {
			listener(snapshot);
		}
	}
}

export function createChatStore(initialMessages: ChatMessage[] = []): ChatStore {
	return new ChatStore(initialMessages);
}
