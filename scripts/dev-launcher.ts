const children = [
	Bun.spawn(['bun', 'run', '--filter', '@dryui/launcher', 'dev'], {
		stdin: 'inherit',
		stdout: 'inherit',
		stderr: 'inherit'
	}),
	Bun.spawn(['bun', 'run', '--filter', '@dryui/launcher', 'dev:server'], {
		stdin: 'inherit',
		stdout: 'inherit',
		stderr: 'inherit'
	})
];

let closed = false;

function stopChildren() {
	if (closed) return;
	closed = true;

	for (const child of children) {
		child.kill();
	}
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
	process.on(signal, () => {
		stopChildren();
		process.exit(0);
	});
}

const exitCode = await Promise.race(children.map((child) => child.exited));
stopChildren();
process.exit(exitCode);
