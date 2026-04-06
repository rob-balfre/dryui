import { fileURLToPath } from 'node:url';
import { createPtyManager } from './pty-manager.js';
import { createStudioGateway, startStudioServer } from './ws-gateway.js';

const bun = (
	globalThis as {
		Bun?: {
			readonly env: Record<string, string | undefined>;
		};
	}
).Bun;

const port = Number(bun?.env.STUDIO_SERVER_PORT ?? '8788');
const host = bun?.env.STUDIO_SERVER_HOST ?? '127.0.0.1';
const workerPath = fileURLToPath(new URL('./dev-prompt-worker.ts', import.meta.url));

const gateway = createStudioGateway({
	createPty: () =>
		createPtyManager({
			command: 'bun',
			args: ['run', workerPath],
			cwd: process.cwd(),
			env: {
				...process.env
			}
		}),
	createPromptPty: () =>
		createPtyManager({
			command: 'bun',
			args: ['run', workerPath],
			cwd: process.cwd(),
			env: {
				...process.env
			}
		})
});

const server = startStudioServer({
	gateway,
	host,
	port
}) as {
	stop(force?: boolean): void;
};

console.log(`Studio server listening on http://${host}:${port}`);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
	process.on(signal, () => {
		server.stop(true);
		process.exit(0);
	});
}
