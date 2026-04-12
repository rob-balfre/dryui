<script lang="ts">
	import { MegaMenu } from '../../../packages/ui/src/mega-menu/index.js';
</script>

<MegaMenu.Root>
	<MegaMenu.Item>
		<MegaMenu.Trigger>Products</MegaMenu.Trigger>
		<MegaMenu.Panel>
			<MegaMenu.Column title="Platform">
				<MegaMenu.Link href="#analytics">Analytics</MegaMenu.Link>
				<MegaMenu.Link href="#automation">Automation</MegaMenu.Link>
			</MegaMenu.Column>
		</MegaMenu.Panel>
	</MegaMenu.Item>
</MegaMenu.Root>
