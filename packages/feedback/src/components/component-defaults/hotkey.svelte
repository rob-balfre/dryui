<script lang="ts">
	import { Hotkey, Kbd } from '@dryui/ui';

	function noop() {}
</script>

<Hotkey keys="ctrl+alt+h" handler={noop} enabled={false} />
<Kbd keys={['Ctrl', 'Alt', 'H']} />
