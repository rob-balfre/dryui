import { mount } from 'svelte';
import '@dryui/ui/themes/default.css';
import '@dryui/ui/themes/dark.css';
import './app.css';
import App from './App.svelte';

const target = document.querySelector('#app');

if (!target) {
	throw new Error('Feedback UI root not found');
}

mount(App, { target });
