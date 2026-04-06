import { buildPromptRequest, renderPromptOutput } from './prompt.js';

async function readInput(): Promise<string> {
	return await new Promise<string>((resolve, reject) => {
		let buffer = '';

		const cleanup = (): void => {
			process.stdin.off('data', onData);
			process.stdin.off('end', onEnd);
			process.stdin.off('error', onError);
		};

		const finish = (value: string): void => {
			cleanup();
			resolve(value);
		};

		const onData = (chunk: string | Uint8Array): void => {
			buffer += typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk);
			const newlineIndex = buffer.indexOf('\n');
			if (newlineIndex !== -1) {
				finish(buffer.slice(0, newlineIndex));
			}
		};

		const onEnd = (): void => {
			finish(buffer);
		};

		const onError = (error: unknown): void => {
			cleanup();
			reject(error);
		};

		process.stdin.on('data', onData);
		process.stdin.once('end', onEnd);
		process.stdin.once('error', onError);
		process.stdin.resume();
	});
}

async function main(): Promise<void> {
	const raw = await readInput();
	const payload = raw.trim();
	const request = payload
		? (() => {
				const parsed = JSON.parse(payload) as {
					sessionId?: string;
					prompt?: string;
					session?: ReturnType<typeof buildPromptRequest>['session'];
				};

				return buildPromptRequest(
					parsed.sessionId ?? 'session',
					parsed.prompt ?? '',
					parsed.session
				);
			})()
		: buildPromptRequest('session', '', undefined);

	process.stdout.write(renderPromptOutput(request), () => {
		process.exit(0);
	});
}

main().catch((error) => {
	process.stderr.write(`${(error as Error).message}\n`);
	process.exitCode = 1;
});
