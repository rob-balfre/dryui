<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Text } from '@dryui/ui';
	import { launcherState } from '$lib/launcher-state.svelte.ts';
	import { saveSession } from '../../routes/session.remote.ts';

	function handleSkip() {
		launcherState.setCurrentStep('workspace');
		void saveSession({
			selected_cli: launcherState.selectedCli,
			project_path: launcherState.projectPath,
			current_step: 'workspace'
		});
		goto('/workspace');
	}
</script>

<Text as="p" size="xs" color="muted" data-skip-text>
	<Button variant="bare" size="sm" onclick={handleSkip} data-skip-btn>skip, use defaults</Button>
</Text>

<style>
	[data-skip-text] {
		text-align: center;
	}

	[data-skip-btn] {
		font-size: inherit;
	}
</style>
