<script lang="ts">
	import { MegaMenu } from '@dryui/ui';
</script>

<MegaMenu.Root>
	<MegaMenu.Item>
		<MegaMenu.Trigger>Products</MegaMenu.Trigger>
		<MegaMenu.Panel>
			<MegaMenu.Column title="Build">
				<MegaMenu.Link href="#">Components</MegaMenu.Link>
				<MegaMenu.Link href="#">Themes</MegaMenu.Link>
				<MegaMenu.Link href="#">Primitives</MegaMenu.Link>
			</MegaMenu.Column>
			<MegaMenu.Column title="Ship">
				<MegaMenu.Link href="#">CLI</MegaMenu.Link>
				<MegaMenu.Link href="#">Plugins</MegaMenu.Link>
				<MegaMenu.Link href="#">Templates</MegaMenu.Link>
			</MegaMenu.Column>
		</MegaMenu.Panel>
	</MegaMenu.Item>
	<MegaMenu.Item>
		<MegaMenu.Trigger>Resources</MegaMenu.Trigger>
		<MegaMenu.Panel>
			<MegaMenu.Column title="Learn">
				<MegaMenu.Link href="#">Documentation</MegaMenu.Link>
				<MegaMenu.Link href="#">Guides</MegaMenu.Link>
				<MegaMenu.Link href="#">Changelog</MegaMenu.Link>
			</MegaMenu.Column>
		</MegaMenu.Panel>
	</MegaMenu.Item>
</MegaMenu.Root>
