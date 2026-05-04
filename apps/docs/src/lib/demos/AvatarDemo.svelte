<script lang="ts">
	import { Avatar } from '@dryui/ui';

	const team = [
		{
			initials: 'AM',
			name: 'Avery Morales',
			role: 'Reviewing PR #842',
			status: 'online' as const,
			src: 'https://i.pravatar.cc/160?img=47'
		},
		{
			initials: 'JK',
			name: 'Jules Kwon',
			role: 'On-call rotation',
			status: 'busy' as const,
			src: 'https://i.pravatar.cc/160?img=68'
		},
		{
			initials: 'RT',
			name: 'Rhea Tanaka',
			role: 'Focus until 16:00',
			status: 'away' as const,
			src: 'https://i.pravatar.cc/160?img=49'
		},
		{
			initials: 'DS',
			name: 'Devon Salehi',
			role: 'Out of office',
			status: 'offline' as const,
			src: 'https://i.pravatar.cc/160?img=33'
		}
	];
</script>

<div class="roster">
	{#each team as member (member.initials)}
		<article class="member">
			<Avatar
				src={member.src}
				fallback={member.initials}
				alt={member.name}
				size="lg"
				status={member.status}
			/>
			<div class="meta">
				<p class="title">{member.name}</p>
				<p class="note">{member.role}</p>
			</div>
		</article>
	{/each}
</div>

<style>
	.roster {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--dry-space-3);
	}

	.member {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.meta {
		display: grid;
		gap: var(--dry-space-1);
	}
	.title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}
	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.4;
	}
</style>
