/**
 * vm.ts: smolvm dev server for DryUI (with HMR)
 *
 * Boots an ephemeral Linux microVM, scaffolds DryUI via `bunx @dryui/cli init`,
 * and starts the Vite dev server with HMR. A host port forward makes the dev
 * server reachable at http://localhost:<PORT> in your Mac browser. Ctrl+C tears
 * the VM down.
 *
 * Also starts an in-VM sidecar that polls `/vmshare/cmd.d/` so another terminal
 * can run `bun vm:exec <args>` to invoke the CLI inside the live VM (see
 * scripts/vm-exec.ts). A `/tmp/dryui-vm-current` symlink points at the active
 * session's shared dir so vm:exec can find it.
 *
 * Implementation notes (hard-won):
 * - smolvm's persistent `machine create/start/exec` is flaky for long workloads;
 *   the ephemeral `machine run` is what stays healthy. Persistent also refuses
 *   a second concurrent exec while the dev server is running, which kills the VM.
 * - smolvm buffers VM stdout for long-running commands, so we mount a shared
 *   host dir and have the VM tee output into it. We tail that from the host.
 * - Vite dev MUST run under `node`, not bun. Under bun's runtime (inside this
 *   alpine VM), Vite's HTTP server prints "ready" but never actually listens
 *   on any TCP port. Under node it listens correctly. So we `apk add nodejs`
 *   and invoke `node ./node_modules/vite/bin/vite.js dev`.
 * - Vite must bind to 0.0.0.0; the smolvm port forward can't reach the guest
 *   loopback.
 *
 * Usage: bun vm
 */

import { mkdirSync, rmSync, symlinkSync, unlinkSync } from 'node:fs';
import net from 'node:net';
import type { AddressInfo } from 'node:net';

const SHARED_DIR = `/tmp/dryui-vm-${process.pid}`;
const CURRENT_LINK = '/tmp/dryui-vm-current';
const LOG_PATH = `${SHARED_DIR}/vm.log`;

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

async function waitForHttp(port: number, timeoutMs: number): Promise<boolean> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const res = await Bun.fetch(`http://127.0.0.1:${port}/`, {
				signal: AbortSignal.timeout(2500)
			});
			if (res.status < 500) return true;
		} catch {
			/* retry until deadline */
		}
		await Bun.sleep(1000);
	}
	return false;
}

function quietly(fn: () => void): void {
	try {
		fn();
	} catch {
		/* best-effort cleanup */
	}
}

const probe = Bun.spawn(['sh', '-c', 'command -v smolvm'], {
	stdout: 'ignore',
	stderr: 'ignore'
});
if ((await probe.exited) !== 0) {
	console.error('smolvm not found on PATH.');
	console.error('Install: curl -sSL https://smolmachines.com/install.sh | /bin/bash');
	process.exit(1);
}

rmSync(SHARED_DIR, { recursive: true, force: true });
mkdirSync(SHARED_DIR, { recursive: true });
mkdirSync(`${SHARED_DIR}/cmd.d`, { recursive: true });

quietly(() => unlinkSync(CURRENT_LINK));
symlinkSync(SHARED_DIR, CURRENT_LINK);

const port = await pickFreePort();

process.stderr.write('Booting smolvm (oven/bun:alpine + node)...\n');
process.stderr.write('First boot: image pull + apk nodejs + scaffold, ~45-90s.\n\n');

// The sidecar loop runs detached inside the VM, picking up *.req files written
// by scripts/vm-exec.ts and writing *.out / *.code next to them.
const vmScript = [
	'set -e',
	'exec > /vmshare/vm.log 2>&1',
	'apk add --no-cache nodejs >/dev/null',
	'mkdir -p /app /vmshare/cmd.d',
	'cd /app',
	'echo "=== dryui init ==="',
	'bunx @dryui/cli init . --pm bun',
	'echo "=== installing @dryui/cli for vm:exec ==="',
	'bun add -d @dryui/cli@latest',
	'echo "=== cmd sidecar ==="',
	'(',
	'  set +e',
	'  cd /app',
	'  export PATH="/app/node_modules/.bin:$PATH"',
	'  while true; do',
	'    for f in /vmshare/cmd.d/*.req; do',
	'      [ -f "$f" ] || continue',
	'      id=$(basename "$f" .req)',
	'      sh -c "$(cat "$f")" > "/vmshare/cmd.d/$id.out" 2>&1',
	'      code=$?',
	'      echo "$code" > "/vmshare/cmd.d/$id.code"',
	'      rm -f "$f"',
	'    done',
	'    sleep 0.3',
	'  done',
	') &',
	'echo "=== vite dev via node ==="',
	'exec node ./node_modules/vite/bin/vite.js dev --host 0.0.0.0 --port 5173 --strictPort'
].join('\n');

const vm = Bun.spawn(
	[
		'smolvm',
		'machine',
		'run',
		'--net',
		'--image',
		'oven/bun:alpine',
		'--mem',
		'8192',
		'-p',
		`${port}:5173`,
		'-v',
		`${SHARED_DIR}:/vmshare`,
		'--',
		'sh',
		'-c',
		vmScript
	],
	{
		stdout: 'inherit',
		stderr: 'inherit',
		stdin: 'inherit'
	}
);

const tail = Bun.spawn(
	['sh', '-c', `until [ -f "${LOG_PATH}" ]; do sleep 1; done; exec tail -F "${LOG_PATH}"`],
	{
		stdout: 'inherit',
		stderr: 'inherit',
		stdin: 'ignore'
	}
);

const cleanup = () => {
	quietly(() => tail.kill('SIGTERM'));
	quietly(() => unlinkSync(CURRENT_LINK));
	quietly(() => rmSync(SHARED_DIR, { recursive: true, force: true }));
};

process.on('SIGINT', () => quietly(() => vm.kill('SIGINT')));
process.on('SIGTERM', () => quietly(() => vm.kill('SIGTERM')));

void (async () => {
	const ready = await waitForHttp(port, 300_000);
	if (ready) {
		process.stderr.write(`\n✓ DryUI dev server ready (HMR): http://localhost:${port}\n`);
		process.stderr.write('  Ctrl+C to stop.\n');
		process.stderr.write('  Run commands inside: `bun vm:exec dryui list` (from any tab)\n\n');
	}
})();

const exitCode = await vm.exited;
cleanup();
process.exit(exitCode);
