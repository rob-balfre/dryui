<script lang="ts">
	import { goto } from '$app/navigation';
	import { toastStore } from '@dryui/ui';
	import {
		PreviewExport,
		wizardState,
		getDerivedTheme,
		getPersonalityTokens,
		getShapeTokens,
		getShadowTokens,
		generateCss,
		encodeRecipe
	} from '@dryui/theme-wizard';
	import { launcherState } from '$lib/launcher-state.svelte.ts';
	import { connect, waitForConnection, applyTheme } from '$lib/ws-client.ts';
	import { saveSession } from '../../session.remote.ts';

	let applying = $state(false);

	async function handleApply() {
		if (!launcherState.projectPath || applying) return;
		applying = true;
		try {
			const theme = getDerivedTheme();
			const { defaultCss, darkCss } = generateCss(theme, {
				personalityTokens: getPersonalityTokens(),
				shapeTokens: getShapeTokens(),
				shadowTokens: getShadowTokens()
			});
			const recipe = encodeRecipe({
				brand: wizardState.brandHsb,
				neutralMode: wizardState.neutralMode,
				statusHues: wizardState.statusHues,
				typography: wizardState.typography,
				shape: wizardState.shape,
				shadows: wizardState.shadows,
				personality: wizardState.personality
			});
			connect();
			await waitForConnection();
			const result = await applyTheme(launcherState.projectPath, defaultCss, darkCss, recipe);
			if (!result.success) {
				toastStore.error(result.error ?? 'Failed to apply theme.');
				applying = false;
				return;
			}
			launcherState.setThemeRecipe(recipe);
			launcherState.setCurrentStep('workspace');
			void saveSession({
				selected_cli: launcherState.selectedCli,
				project_path: launcherState.projectPath,
				current_step: 'workspace'
			});
			goto('/workspace');
		} catch (err) {
			toastStore.error(err instanceof Error ? err.message : 'Failed to apply theme.');
			applying = false;
		}
	}
</script>

<PreviewExport onprev={() => goto('/theme/shadows')} onapply={handleApply} />
