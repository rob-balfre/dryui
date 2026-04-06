#!/usr/bin/env bun
/**
 * Scaffold a new thumbnail SVG component.
 * Usage: bun run thumbnail:create <ComponentName>
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const name = process.argv[2];
if (!name) {
	console.error('Usage: bun run thumbnail:create <ComponentName>');
	process.exit(1);
}

// Convert PascalCase to kebab-case
const kebab = name
	.replace(/([a-z])([A-Z])/g, '$1-$2')
	.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
	.toLowerCase();

const dir = join(import.meta.dir, '..', 'src', 'thumbnail');
const filePath = join(dir, `${kebab}.svelte`);
const indexPath = join(dir, 'index.ts');

if (existsSync(filePath)) {
	console.error(`Thumbnail already exists: ${filePath}`);
	process.exit(1);
}

// Write placeholder thumbnail
const template = `<script lang="ts">
  import { Svg } from '@dryui/primitives';
  import styles from './thumbnail.module.css';

  interface Props {
    size?: 'sm' | 'md' | 'lg' | number;
    class?: string;
  }

  let { size = 'md', class: className }: Props = $props();

  const sizeStyle = $derived(
    typeof size === 'number'
      ? \`width:\${size}px;height:\${Math.round(size / 1.5)}px\`
      : undefined
  );
  const sizeClass = $derived(typeof size === 'string' ? styles[size] ?? '' : '');
</script>

<span class="{styles.thumbnail} {sizeClass} {className ?? ''}" style={sizeStyle}>
  <Svg viewBox="0 0 120 80" aria-label="${name} thumbnail" width="100%" height="100%">
    <rect x="5" y="5" width="110" height="70" rx="8"
      fill="var(--dry-color-surface)"
      stroke="var(--dry-color-border)"
      stroke-width="1" />
    <text x="60" y="44" text-anchor="middle"
      font-size="10" fill="var(--dry-color-muted)">
      ${name}
    </text>
  </Svg>
</span>
`;

writeFileSync(filePath, template);
console.log(`Created: ${filePath}`);

// Update index.ts — add import and map entry
let index = readFileSync(indexPath, 'utf-8');

// 1. Add import after the last existing "import Thumbnail" line
const importLine = `import Thumbnail${name} from './${kebab}.svelte';`;
const lastImportMatch = [...index.matchAll(/^import Thumbnail[^\n]*/gm)].at(-1);
if (!lastImportMatch || lastImportMatch.index === undefined) {
	console.error('Could not find import section in index.ts');
	process.exit(1);
}
const insertAfterImport = lastImportMatch.index + lastImportMatch[0].length;
index = index.slice(0, insertAfterImport) + '\n' + importLine + index.slice(insertAfterImport);

// 2. Add entry to thumbnailMap — before its closing };
const mapClosePattern = /(\n)(};\n\nexport const Thumbnail\b)/;
const mapCloseMatch = mapClosePattern.exec(index);
if (!mapCloseMatch || mapCloseMatch.index === undefined) {
	console.error('Could not find thumbnailMap closing }; in index.ts');
	process.exit(1);
}
const mapInsertAt = mapCloseMatch.index + mapCloseMatch[1].length; // after the \n before };
index = index.slice(0, mapInsertAt) + `  '${name}': Thumbnail${name},\n` + index.slice(mapInsertAt);

writeFileSync(indexPath, index);
console.log(`Updated: ${indexPath}`);
console.log(`\nReminder: Customize the SVG in ${filePath}`);
