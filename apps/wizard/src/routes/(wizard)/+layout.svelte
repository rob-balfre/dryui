<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { createWizardWsClient } from '../../lib/ws';
	import { createWizardController } from '../../lib/wizard-state.svelte';
	import { setWizardController } from '../../lib/wizard-context.svelte';
	import WizardShell from '../../lib/components/WizardShell.svelte';

	let { children }: { children: Snippet } = $props();

	const controller = createWizardController();
	setWizardController(controller);

	onMount(() => {
		const client = createWizardWsClient({
			onMessage: (message) => controller.handleServerMessage(message),
			onStatusChange: (status) => controller.setConnectionStatus(status)
		});

		controller.attachTransport(client);
		void controller.loadCatalog().catch(() => {
			controller.setConnectionStatus('error');
		});
		client.connect();

		return () => {
			client.disconnect();
			controller.attachTransport(null);
		};
	});
</script>

<WizardShell {controller} {children} />
