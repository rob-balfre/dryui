# Changelog

The docs changelog page is generated from live repo metadata in
[`apps/docs/src/routes/changelog/+page.server.ts`](apps/docs/src/routes/changelog/+page.server.ts).

It pulls from:

- `packages/*/package.json` for package versions
- `packages/mcp/src/spec.json` for current MCP component inventory
- `.changeset/*.md` for pending unreleased notes

If you want to update what shows up on `/changelog`, add or edit a changeset and keep the package metadata accurate.
