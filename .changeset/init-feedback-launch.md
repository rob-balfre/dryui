---
'@dryui/cli': minor
---

`dryui init` now wires `@dryui/feedback` into the scaffolded project (install, mount `<Feedback />` in the root layout, patch `vite.config` `ssr.noExternal`) and offers to launch the feedback dashboard in a TTY. Pass `--no-launch` to skip the prompt.
