import { mount } from 'svelte';
import '@dryui/ui/themes/default.css';
import '@dryui/ui/themes/dark.css';
import './app.css';
import Launcher from './Launcher.svelte';

const target = document.querySelector('#app');

if (!target) {
	throw new Error('Launcher UI root not found');
}

mount(Launcher, { target });
