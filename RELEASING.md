# Releasing

Canonical release and publish guidance for this repository lives here. Link to this file from other docs instead of copying the workflow or npm-token instructions.

## Automated release flow

Releases are automated via [Changesets](https://github.com/changesets/changesets) and `.github/workflows/release.yml`:

1. Run `bun run changeset`
2. Merge or push the change to `main`
3. CI runs `bun run release:gate`
4. CI runs `bun run version`, commits the version and changelog updates back to `main`, then pushes that release commit
5. CI publishes to npm, pushes the package tags, and creates GitHub Releases

`@dryui/primitives` and `@dryui/ui` are version-linked and should be treated as a fixed pair.

The release workflow expects pushes to `main` to be able to write back the release commit and tags.

## Manual release

For a local release, run:

```bash
bun run release
```

That runs `release:gate`, versions packages, and publishes with Changesets. Local release and CI release use the same no-test validation gate before versioning or publish. `release:gate` skips publish hygiene because `publish:packages` reruns the package build, applies the publish export swap, and runs publish hygiene against the exact package shape npm receives. The `prepack` / `postpack` hooks handle export swapping for `@dryui/primitives`, `@dryui/ui`, and `@dryui/mcp` during one-off package commands.

For one-off package publishing, use:

```bash
bun run scripts/publish.ts <package-dir> [--otp <code>] [--dry-run]
```

## Maintainer Note: npm auth

There is a gitignored project-level `.npmrc` at the repo root. It takes precedence over `~/.npmrc` when publish commands run from inside the repository.

The GitHub Actions `NPM_TOKEN` secret must match `./.npmrc`, not `~/.npmrc`.

To rotate the CI secret to match the repo token:

```bash
awk -F= '/^\/\/registry.npmjs.org\/:_authToken=/{printf "%s", $2}' ./.npmrc \
  | gh secret set NPM_TOKEN --repo rob-balfre/dryui
```

Rules:

- Pipe via stdin; do not paste tokens into the GitHub web UI.
- Use `printf` / `awk ... printf` so there is no trailing newline.
- npm auth failures can show up as misleading 404s on publish.
