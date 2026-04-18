<script lang="ts">
	export type CompetitorLogoId = 'figma-make' | 'claude-design' | 'stitch' | 'shadcn' | 'v0';

	interface Props {
		id: CompetitorLogoId;
		size?: number;
	}

	let { id, size = 20 }: Props = $props();
</script>

<span class="competitor-logo" data-id={id} aria-hidden="true">
	{#if id === 'figma-make'}
		<svg viewBox="0 0 24 24" width={size} height={size}>
			<path fill="#F24E1E" d="M8 2h4v7.333H8A3.667 3.667 0 0 1 8 2z" />
			<path fill="#FF7262" d="M12 2h4a3.667 3.667 0 0 1 0 7.333h-4V2z" />
			<path fill="#A259FF" d="M8 9.333h4v7.334H8a3.667 3.667 0 0 1 0-7.334z" />
			<path fill="#1ABCFE" d="M19.667 13a3.667 3.667 0 1 1-7.334 0 3.667 3.667 0 0 1 7.334 0z" />
			<path fill="#0ACF83" d="M8 16.667h4V20.333a3.667 3.667 0 1 1-4-3.666z" />
		</svg>
	{:else if id === 'claude-design'}
		<svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
			<path
				d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"
			/>
		</svg>
	{:else if id === 'stitch'}
		<svg
			viewBox="0 0 24 24"
			width={size}
			height={size}
			fill="none"
			stroke-width="2.2"
			stroke-linecap="round"
		>
			<line x1="4" y1="7" x2="7" y2="10" stroke="#4285F4" />
			<line x1="10" y1="7" x2="13" y2="10" stroke="#EA4335" />
			<line x1="16" y1="7" x2="19" y2="10" stroke="#FBBC04" />
			<line x1="4" y1="14" x2="7" y2="17" stroke="#34A853" />
			<line x1="10" y1="14" x2="13" y2="17" stroke="#4285F4" />
			<line x1="16" y1="14" x2="19" y2="17" stroke="#EA4335" />
		</svg>
	{:else if id === 'shadcn'}
		<svg viewBox="0 0 24 24" width={size} height={size}>
			<path fill="currentColor" d="M5.879 22 4.464 20.586 18.121 2 19.536 3.414 5.879 22z" />
			<path
				fill="currentColor"
				d="M13.464 20.586l1.414 1.414L22 15.536l-1.414-1.414-7.122 6.464z"
			/>
		</svg>
	{:else if id === 'v0'}
		<svg viewBox="0 0 40 24" width={size * 1.67} height={size}>
			<rect width="40" height="24" rx="6" fill="currentColor" />
			<text
				x="20"
				y="17.5"
				font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
				font-weight="900"
				font-size="15"
				text-anchor="middle"
				fill="var(--dry-color-bg-base)"
				letter-spacing="-0.5"
			>
				v0
			</text>
		</svg>
	{/if}
</span>

<style>
	.competitor-logo {
		display: inline-grid;
		place-items: center;
	}

	.competitor-logo[data-id='claude-design'] {
		color: hsl(25 100% 65%);
	}

	.competitor-logo[data-id='shadcn'],
	.competitor-logo[data-id='v0'] {
		color: var(--dry-color-text-strong);
	}
</style>
