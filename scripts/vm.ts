/**
 * vm.ts — smolvm dev server for DryUI
 *
 * Boots a disposable Linux microVM, runs `bunx @dryui/cli init`, and starts
 * the Vite dev server with a host port forward so HMR works in your Mac
 * browser. Cleans up the VM on Ctrl+C or exit.
 *
 * Usage: bun vm
 */

import net from 'node:net';
import type { AddressInfo } from 'node:net';

const NAME = 'dryui-dev';
let stopping = false;

function pickFreePort(): Promise<number> {
	return new Promise((resolve, reject) => {
		const srv = net.createServer();
		srv.unref();
		srv.on('error', reject);
		srv.listen(0, () => {
			const port = (srv.address() as AddressInfo).port;
			srv.close(() => resolve(port));
		});
	});
}

async function run(cmd: string[], opts: { quiet?: boolean } = {}): Promise<number> {
	const proc = Bun.spawn(cmd, {
		stdout: opts.quiet ? 'ignore' : 'inherit',
		stderr: opts.quiet ? 'ignore' : 'inherit',
		stdin: 'inherit'
	});
	return await proc.exited;
}

async function shutdown(code: number): Promise<never> {
	if (stopping) {
		// Another shutdown is already running; wait for it to exit the process.
		await new Promise(() => {});
	}
	stopping = true;
	process.stderr.write(`\nCleaning up VM "${NAME}"...\n`);
	await run(['smolvm', 'machine', 'delete', '-f', NAME], { quiet: true });
	process.exit(code);
}

process.on('SIGINT', () => void shutdown(130));
process.on('SIGTERM', () => void shutdown(143));

const probe = Bun.spawn(['sh', '-c', 'command -v smolvm'], { stdout: 'ignore', stderr: 'ignore' });
if ((await probe.exited) !== 0) {
	console.error('smolvm not found on PATH.');
	console.error('Install: curl -sSL https://smolmachines.com/install.sh | bash');
	process.exit(1);
}

const port = await pickFreePort();
process.stderr.write(`Picked host port ${port}\n`);

await run(['smolvm', 'machine', 'delete', '-f', NAME], { quiet: true });

let code = await run([
	'smolvm',
	'machine',
	'create',
	'--net',
	'--image',
	'oven/bun:alpine',
	'-p',
	`${port}:5173`,
	NAME
]);
if (code !== 0) await shutdown(code);

code = await run(['smolvm', 'machine', 'start', '--name', NAME]);
if (code !== 0) await shutdown(code);

process.stderr.write('Installing DryUI in VM...\n');
code = await run([
	'smolvm',
	'machine',
	'exec',
	'--name',
	NAME,
	'--',
	'sh',
	'-c',
	'bunx -y @dryui/cli init /app --pm bun'
]);
if (code !== 0) await shutdown(code);

process.stderr.write(`\n→ http://localhost:${port}\n\n`);
await run([
	'smolvm',
	'machine',
	'exec',
	'--name',
	NAME,
	'--',
	'sh',
	'-c',
	'cd /app && bun run dev -- --host 0.0.0.0 --port 5173'
]);

await shutdown(0);
