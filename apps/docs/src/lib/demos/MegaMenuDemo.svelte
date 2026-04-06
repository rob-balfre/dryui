<script lang="ts">
	import { MegaMenu } from '@dryui/ui';
</script>

<MegaMenu.Root>
	<MegaMenu.Item>
		<MegaMenu.Trigger>Products</MegaMenu.Trigger>
		<MegaMenu.Panel>
			<MegaMenu.Column title="Platform">
				<MegaMenu.Link href="#analytics">Analytics</MegaMenu.Link>
				<MegaMenu.Link href="#automation">Automation</MegaMenu.Link>
				<MegaMenu.Link href="#integrations">Integrations</MegaMenu.Link>
			</MegaMenu.Column>

			<MegaMenu.Column title="Resources">
				<MegaMenu.Link href="#documentation">Documentation</MegaMenu.Link>
				<MegaMenu.Link href="#tutorials">Tutorials</MegaMenu.Link>
				<MegaMenu.Link href="#community">Community</MegaMenu.Link>
			</MegaMenu.Column>
		</MegaMenu.Panel>
	</MegaMenu.Item>

	<MegaMenu.Item>
		<MegaMenu.Trigger>Company</MegaMenu.Trigger>
		<MegaMenu.Panel>
			<MegaMenu.Column title="About">
				<MegaMenu.Link href="#story">Our story</MegaMenu.Link>
				<MegaMenu.Link href="#careers">Careers</MegaMenu.Link>
				<MegaMenu.Link href="#contact">Contact</MegaMenu.Link>
			</MegaMenu.Column>
		</MegaMenu.Panel>
	</MegaMenu.Item>
</MegaMenu.Root>
