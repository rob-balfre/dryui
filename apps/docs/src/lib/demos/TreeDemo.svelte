<script lang="ts">
	import { Tree } from '@dryui/ui';
</script>

<Tree.Root defaultExpanded={['src', 'src-routes', 'src-lib', 'packages']}>
	<Tree.Item itemId="packages">
		<Tree.ItemLabel>packages/</Tree.ItemLabel>
		<Tree.ItemChildren>
			<Tree.Item itemId="packages-ui">
				<Tree.ItemLabel>ui/</Tree.ItemLabel>
			</Tree.Item>
			<Tree.Item itemId="packages-cli">
				<Tree.ItemLabel>cli/</Tree.ItemLabel>
			</Tree.Item>
			<Tree.Item itemId="packages-feedback">
				<Tree.ItemLabel>feedback/</Tree.ItemLabel>
			</Tree.Item>
		</Tree.ItemChildren>
	</Tree.Item>

	<Tree.Item itemId="src">
		<Tree.ItemLabel>src/</Tree.ItemLabel>
		<Tree.ItemChildren>
			<Tree.Item itemId="src-routes">
				<Tree.ItemLabel>routes/</Tree.ItemLabel>
				<Tree.ItemChildren>
					<Tree.Item itemId="src-routes-layout">
						<Tree.ItemLabel>+layout.svelte</Tree.ItemLabel>
					</Tree.Item>
					<Tree.Item itemId="src-routes-page">
						<Tree.ItemLabel>+page.svelte</Tree.ItemLabel>
					</Tree.Item>
					<Tree.Item itemId="src-routes-about">
						<Tree.ItemLabel>about/+page.svelte</Tree.ItemLabel>
					</Tree.Item>
				</Tree.ItemChildren>
			</Tree.Item>
			<Tree.Item itemId="src-lib">
				<Tree.ItemLabel>lib/</Tree.ItemLabel>
				<Tree.ItemChildren>
					<Tree.Item itemId="src-lib-components">
						<Tree.ItemLabel>components/</Tree.ItemLabel>
					</Tree.Item>
					<Tree.Item itemId="src-lib-utils">
						<Tree.ItemLabel>utils.ts</Tree.ItemLabel>
					</Tree.Item>
				</Tree.ItemChildren>
			</Tree.Item>
			<Tree.Item itemId="src-app-html">
				<Tree.ItemLabel>app.html</Tree.ItemLabel>
			</Tree.Item>
		</Tree.ItemChildren>
	</Tree.Item>

	<Tree.Item itemId="package-json">
		<Tree.ItemLabel>package.json</Tree.ItemLabel>
	</Tree.Item>
	<Tree.Item itemId="readme">
		<Tree.ItemLabel>README.md</Tree.ItemLabel>
	</Tree.Item>
</Tree.Root>
