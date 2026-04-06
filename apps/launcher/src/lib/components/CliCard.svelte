<script lang="ts">
	import { Card } from '@dryui/ui/card';
	import { Badge } from '@dryui/ui/badge';
	import { Heading } from '@dryui/ui/heading';
	import { Link } from '@dryui/ui/link';
	import { Text } from '@dryui/ui/text';

	import type { CliDefinition } from '../cli-definitions.ts';
	import { launcherState, type ValidationStatus } from '../launcher-state.svelte.ts';
	import type { BadgeColor } from '@dryui/ui';
	import CliIcon from './CliIcon.svelte';

	interface Props {
		definition: CliDefinition;
		onSelect: () => void;
	}

	let { definition, onSelect }: Props = $props();

	let validation = $derived(launcherState.validations[definition.id]);
	let versionCheck = $derived(launcherState.versionInfo[definition.id]);
	let isSelected = $derived(launcherState.selectedCli === definition.id);
	let isDisabled = $derived(validation.status === 'not-found' || validation.status === 'error');
	let isValidated = $derived(launcherState.cliValidated[definition.id] === true);

	const statusBadge: Record<
		ValidationStatus,
		{ label: string; color: BadgeColor; variant: 'soft' | 'outline' | 'dot' }
	> = {
		idle: { label: 'Not checked', color: 'gray', variant: 'outline' },
		checking: { label: 'Checking…', color: 'blue', variant: 'dot' },
		found: { label: 'Installed', color: 'green', variant: 'soft' },
		'needs-auth': { label: 'Sign in required', color: 'yellow', variant: 'soft' },
		'not-found': { label: 'Not found', color: 'red', variant: 'soft' },
		error: { label: 'Error', color: 'red', variant: 'soft' }
	};

	let badge = $derived(statusBadge[validation.status]);
	let displayVersion = $derived(
		versionCheck?.installed ?? validation.version?.match(/(\d+\.\d+\.\d+)/)?.[1]
	);

	function handleClick() {
		if (isDisabled) return;
		onSelect();
	}
</script>

<Card.Root
	variant="interactive"
	as="button"
	selected={isSelected}
	disabled={isDisabled}
	onclick={handleClick}
>
	<Card.Content>
		<div class="card-stack">
			<CliIcon cli={definition.id} />
			<Heading level={3}>{definition.name}</Heading>
			<Text as="span" color="muted" size="sm">{definition.vendor}</Text>
			{#if displayVersion && validation.status === 'found'}
				<Badge variant={badge.variant} color={badge.color}>
					v{displayVersion}
				</Badge>
			{:else}
				<Badge variant={badge.variant} color={badge.color} pulse={validation.status === 'checking'}>
					{badge.label}
				</Badge>
			{/if}
			{#if versionCheck?.updateAvailable && versionCheck.latest}
				<Badge variant="soft" color="orange">v{versionCheck.latest} available</Badge>
			{/if}
			{#if isValidated}
				<Badge variant="soft" color="green" size="sm">Signed in</Badge>
			{/if}
		</div>
	</Card.Content>
	{#if isDisabled}
		<Card.Footer>
			<div class="footer-stack">
				<Link href={definition.installUrl} external underline="always">Download</Link>
			</div>
		</Card.Footer>
	{/if}
</Card.Root>

<style>
	.card-stack {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: center;
	}

	.footer-stack {
		display: grid;
		justify-items: center;
	}
</style>
