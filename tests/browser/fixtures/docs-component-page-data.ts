type ComponentKind = 'primitive' | 'component' | 'namespace';

export interface ComponentPageData {
	name: string;
	kind: ComponentKind;
	sourceUrl: string;
	quickStartCode: string;
	related?: unknown;
}

const repoUrl = 'https://github.com/rob-balfre/dryui';

const pageDataBySlug: Record<string, ComponentPageData> = {
	button: {
		name: 'Button',
		kind: 'component',
		sourceUrl: `${repoUrl}/tree/main/packages/ui/src/button`,
		quickStartCode: '<script lang="ts">\n  import { Button } from \'@dryui/ui\';\n</script>'
	},
	'date-range-picker': {
		name: 'DateRangePicker',
		kind: 'component',
		sourceUrl: `${repoUrl}/tree/main/packages/ui/src/date-range-picker`,
		quickStartCode:
			'<script lang="ts">\n  import { DateRangePicker } from \'@dryui/ui\';\n</script>'
	},
	typography: {
		name: 'Typography',
		kind: 'namespace',
		sourceUrl: `${repoUrl}/tree/main/packages/ui/src/typography`,
		quickStartCode: '<script lang="ts">\n  import { Typography } from \'@dryui/ui\';\n</script>'
	},
	dialog: {
		name: 'Dialog',
		kind: 'component',
		sourceUrl: `${repoUrl}/tree/main/packages/ui/src/dialog`,
		quickStartCode: '<script lang="ts">\n  import { Dialog } from \'@dryui/ui\';\n</script>'
	},
	reveal: {
		name: 'Reveal',
		kind: 'component',
		sourceUrl: `${repoUrl}/tree/main/packages/ui/src/reveal`,
		quickStartCode: '<script lang="ts">\n  import { Reveal } from \'@dryui/ui\';\n</script>'
	},
	'multi-city-search-form': {
		name: 'MultiCitySearchForm',
		kind: 'component',
		sourceUrl: `${repoUrl}/tree/main/packages/ui/src/multi-city-search-form`,
		quickStartCode:
			'<script lang="ts">\n  import { MultiCitySearchForm } from \'@dryui/ui\';\n</script>'
	}
};

export function getComponentPageData(slug: string): ComponentPageData {
	const data = pageDataBySlug[slug];

	if (!data) {
		throw new Error(`Unknown component slug: ${slug}`);
	}

	return data;
}
