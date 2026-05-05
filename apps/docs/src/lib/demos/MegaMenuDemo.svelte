<script lang="ts">
	import { MegaMenu } from '@dryui/ui';
</script>

<MegaMenu.Root>
	<MegaMenu.Item>
		<MegaMenu.Trigger>Product</MegaMenu.Trigger>
		<MegaMenu.Panel>
			<MegaMenu.Column title="Build">
				<MegaMenu.Link href="#components">Components</MegaMenu.Link>
				<MegaMenu.Link href="#themes">Themes</MegaMenu.Link>
				<MegaMenu.Link href="#cli">CLI</MegaMenu.Link>
			</MegaMenu.Column>
			<MegaMenu.Column title="Learn">
				<MegaMenu.Link href="#docs">Documentation</MegaMenu.Link>
				<MegaMenu.Link href="#patterns">Patterns</MegaMenu.Link>
				<MegaMenu.Link href="#changelog">Changelog</MegaMenu.Link>
			</MegaMenu.Column>
		</MegaMenu.Panel>
	</MegaMenu.Item>
	<MegaMenu.Item>
		<MegaMenu.Trigger>Pricing</MegaMenu.Trigger>
		<MegaMenu.Panel>
			<MegaMenu.Column title="Plans">
				<MegaMenu.Link href="#team">Team</MegaMenu.Link>
				<MegaMenu.Link href="#enterprise">Enterprise</MegaMenu.Link>
			</MegaMenu.Column>
		</MegaMenu.Panel>
	</MegaMenu.Item>
</MegaMenu.Root>
