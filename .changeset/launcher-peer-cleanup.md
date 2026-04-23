---
'@dryui/cli': patch
---

Kill peer server PIDs when one side of the launcher rejects so failed startups do not leave orphaned background processes.

`dryui` and `dryui dev` start two servers in parallel (feedback + docs, or feedback + user dev server). Previously a rejection on one side left the other side's spawned PID running after the command exited. The launcher now awaits both promises, and if either rejects, the owned PIDs of any fulfilled peers are passed to `killOwnedProcess` before the error is rethrown.
