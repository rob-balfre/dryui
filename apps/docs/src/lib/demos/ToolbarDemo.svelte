<script lang="ts">
	import { Toolbar } from '@dryui/ui';
	import { Bold, Italic, Code2, Link as LinkIcon, List as ListIcon } from 'lucide-svelte';
</script>

<Toolbar.Root>
	<Toolbar.Button aria-label="Bold" title="Bold">
		<Bold size={16} aria-hidden="true" />
	</Toolbar.Button>
	<Toolbar.Button aria-label="Italic" title="Italic">
		<Italic size={16} aria-hidden="true" />
	</Toolbar.Button>
	<Toolbar.Button aria-label="Inline code" title="Inline code">
		<Code2 size={16} aria-hidden="true" />
	</Toolbar.Button>
	<Toolbar.Separator />
	<Toolbar.Button aria-label="Bulleted list" title="Bulleted list">
		<ListIcon size={16} aria-hidden="true" />
	</Toolbar.Button>
	<Toolbar.Button aria-label="Insert link" title="Insert link">
		<LinkIcon size={16} aria-hidden="true" />
	</Toolbar.Button>
</Toolbar.Root>
