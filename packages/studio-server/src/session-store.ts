import type { CanvasCommand, LayoutDocument, StudioSessionSnapshot } from './types.js';

export interface StudioSessionRecord {
	readonly id: string;
	createdAt: string;
	updatedAt: string;
	lastSeenAt: string;
	status: 'idle' | 'active' | 'closed';
	clientId?: string | undefined;
	attachedPty: boolean;
	commandCount: number;
	document?: LayoutDocument | undefined;
	metadata: Record<string, unknown>;
	commandHistory: CanvasCommand[];
}

export interface CreateSessionInput {
	readonly id?: string;
	readonly clientId?: string | undefined;
	readonly metadata?: Record<string, unknown>;
	readonly document?: LayoutDocument | undefined;
}

export class StudioSessionStore {
	#sessions = new Map<string, StudioSessionRecord>();

	createSession(input: CreateSessionInput = {}): StudioSessionRecord {
		const now = new Date().toISOString();
		const id = input.id ?? crypto.randomUUID();
		const session: StudioSessionRecord = {
			id,
			createdAt: now,
			updatedAt: now,
			lastSeenAt: now,
			status: 'idle',
			attachedPty: false,
			commandCount: 0,
			metadata: { ...(input.metadata ?? {}) },
			commandHistory: []
		};

		if (input.clientId !== undefined) {
			session.clientId = input.clientId;
		}

		if (input.document !== undefined) {
			session.document = input.document;
		}

		this.#sessions.set(id, session);
		return session;
	}

	getSession(id: string): StudioSessionRecord | undefined {
		return this.#sessions.get(id);
	}

	listSessions(): StudioSessionRecord[] {
		return [...this.#sessions.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	}

	touchSession(id: string): StudioSessionRecord | undefined {
		const session = this.#sessions.get(id);
		if (!session) {
			return undefined;
		}

		session.lastSeenAt = new Date().toISOString();
		session.updatedAt = session.lastSeenAt;
		return session;
	}

	updateSession(
		id: string,
		updater: (session: StudioSessionRecord) => void
	): StudioSessionRecord | undefined {
		const session = this.#sessions.get(id);
		if (!session) {
			return undefined;
		}

		updater(session);
		session.updatedAt = new Date().toISOString();
		return session;
	}

	attachPty(id: string): StudioSessionRecord | undefined {
		return this.updateSession(id, (session) => {
			session.attachedPty = true;
			session.status = 'active';
		});
	}

	detachPty(id: string): StudioSessionRecord | undefined {
		return this.updateSession(id, (session) => {
			session.attachedPty = false;
			if (session.status !== 'closed') {
				session.status = 'idle';
			}
		});
	}

	recordCommand(id: string, command: CanvasCommand): StudioSessionRecord | undefined {
		return this.updateSession(id, (session) => {
			session.commandHistory.push(command);
			session.commandCount += 1;
			session.status = 'active';
		});
	}

	setDocument(id: string, document: LayoutDocument): StudioSessionRecord | undefined {
		return this.updateSession(id, (session) => {
			session.document = document;
		});
	}

	closeSession(id: string): StudioSessionRecord | undefined {
		return this.updateSession(id, (session) => {
			session.status = 'closed';
			session.attachedPty = false;
		});
	}

	removeSession(id: string): boolean {
		return this.#sessions.delete(id);
	}

	snapshot(id: string): StudioSessionSnapshot | undefined {
		const session = this.#sessions.get(id);
		if (!session) {
			return undefined;
		}

		return {
			id: session.id,
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
			lastSeenAt: session.lastSeenAt,
			status: session.status,
			clientId: session.clientId,
			attachedPty: session.attachedPty,
			commandCount: session.commandCount,
			document: session.document,
			metadata: { ...session.metadata }
		};
	}
}

export function createStudioSessionStore(): StudioSessionStore {
	return new StudioSessionStore();
}
