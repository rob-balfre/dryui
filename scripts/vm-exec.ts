/**
 * vm-exec.ts: run a command inside the live `bun vm` session
 *
 * Drops a request file into the running VM's shared dir, waits for the
 * in-VM sidecar loop in scripts/vm.ts to execute it, and streams the output
 * back. The live session is discovered via the /tmp/dryui-vm-current symlink
 * that vm.ts maintains.
 *
 * Usage:
 *   bun vm:exec dryui list
 *   bun vm:exec -- dryui info Button
 *   bun vm:exec 'ls -la /app && echo hi'
 */

import { existsSync, readlinkSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const LINK = '/tmp/dryui-vm-current';

if (!existsSync(LINK)) {
	console.error('No live `bun vm` session found (missing /tmp/dryui-vm-current).');
	console.error('Run `bun vm` in another terminal first.');
	process.exit(1);
}

const sharedDir = readlinkSync(LINK);
if (!existsSync(`${sharedDir}/cmd.d`)) {
	console.error(`Session dir ${sharedDir} is missing cmd.d. Restart \`bun vm\`.`);
	process.exit(1);
}

// Strip a leading `--` separator if present, so `bun vm:exec -- dryui list` works.
const rawArgs = process.argv.slice(2);
const args = rawArgs[0] === '--' ? rawArgs.slice(1) : rawArgs;

if (args.length === 0) {
	console.error('Usage: bun vm:exec <command> [args...]');
	console.error('       bun vm:exec -- dryui info Button');
	console.error("       bun vm:exec 'ls -la /app'");
	process.exit(2);
}

// If the caller passed a single arg, treat it as a raw shell string.
// Multiple args are joined with shell-escaped quoting so each stays atomic.
const cmd =
	args.length === 1
		? args[0]
		: args.map((a) => `'${(a as string).replaceAll("'", "'\"'\"'")}'`).join(' ');

const id = randomBytes(6).toString('hex');
const reqPath = `${sharedDir}/cmd.d/${id}.req`;
const outPath = `${sharedDir}/cmd.d/${id}.out`;
const codePath = `${sharedDir}/cmd.d/${id}.code`;

await Bun.write(reqPath, `${cmd}\n`);

// Tail the out file live so long-running commands stream to the user.
const tail = Bun.spawn(
	['sh', '-c', `until [ -f "${outPath}" ]; do sleep 0.1; done; exec tail -n +1 -F "${outPath}"`],
	{ stdout: 'inherit', stderr: 'inherit', stdin: 'ignore' }
);

// Poll for the sentinel that the sidecar writes once the command exits.
while (!existsSync(codePath)) {
	await Bun.sleep(200);
}

// Give the tail a moment to catch up to the final writes, then stop it.
await Bun.sleep(300);
try {
	tail.kill('SIGTERM');
} catch {
	/* already dead */
}

const codeText = await Bun.file(codePath).text();
const exitCode = parseInt(codeText.trim(), 10);
process.exit(Number.isFinite(exitCode) ? exitCode : 0);
