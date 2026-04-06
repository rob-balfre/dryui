<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Toast } from '@dryui/ui';
	import { launcherState } from '$lib/launcher-state.svelte.ts';
	import { connect } from '$lib/ws-client.ts';
	import { saveSession } from '../session.remote.ts';

	let { children } = $props();

	onMount(() => {
		if (!launcherState.projectPath) {
			goto('/project');
			return;
		}
		launcherState.setCurrentStep('theme');
		void saveSession({
			selected_cli: launcherState.selectedCli,
			project_path: launcherState.projectPath,
			current_step: 'theme'
		});
		connect();
	});
</script>

{@render children()}
<Toast.Provider position="bottom-center" />
