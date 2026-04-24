<script lang="ts">
	import { Accordion } from '@dryui/ui';
</script>

<Accordion.Root type="single" value={['install']}>
	<Accordion.Item value="install">
		<Accordion.Trigger>How do I install DryUI?</Accordion.Trigger>
		<Accordion.Content>
			<p>
				Run <code>bun add @dryui/ui</code>, then import <code>@dryui/ui/themes/default.css</code>
				and <code>@dryui/ui/themes/dark.css</code> in your root layout. Add
				<code>class="theme-auto"</code> to the <code>&lt;html&gt;</code> element so components pick up
				the user's system preference.
			</p>
		</Accordion.Content>
	</Accordion.Item>

	<Accordion.Item value="customize">
		<Accordion.Trigger>Can I override the palette?</Accordion.Trigger>
		<Accordion.Content>
			<p>
				Yes. Redeclare the tier-two semantic tokens in your own stylesheet (for example
				<code>--dry-color-primary</code> or <code>--dry-color-bg-base</code>). Do not override tier
				three component tokens unless you need per-component control.
			</p>
		</Accordion.Content>
	</Accordion.Item>

	<Accordion.Item value="runtime">
		<Accordion.Trigger>What ships at runtime?</Accordion.Trigger>
		<Accordion.Content>
			<p>
				Svelte 5 plus the components you import. There are no third-party dependencies. Popovers,
				dialogs, and scroll anchoring use the platform's native APIs.
			</p>
		</Accordion.Content>
	</Accordion.Item>

	<Accordion.Item value="ssr">
		<Accordion.Trigger>Does server-side rendering work?</Accordion.Trigger>
		<Accordion.Content>
			<p>
				Every component SSRs without placeholders. State-bearing components hydrate in place and
				never wait for the first client render to show content.
			</p>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>

<style>
	p {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		line-height: 1.6;
		color: var(--dry-color-text-strong);
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: 0.92em;
	}
</style>
