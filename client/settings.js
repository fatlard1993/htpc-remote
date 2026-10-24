import { FormDialog, readStorage, writeStorage } from '@vanilla-bean/components';

import context from './context.js';

const speed = value => (value > 0 && value <= 99 ? null : 'Must be a number above 0, up to 99');

export const settings = () => readStorage('settings', { cursorSpeed: 1, scrollSpeed: 2 });

export const openSettings = () =>
	new FormDialog({
		appendTo: document.body,
		header: 'Settings',
		data: settings(),
		inputs: [
			{ key: 'cursorSpeed', type: 'number', step: 0.5, parse: parseFloat, validate: speed },
			{ key: 'scrollSpeed', type: 'number', step: 0.5, parse: parseFloat, validate: speed },
		],
		onSave: ({ cursorSpeed, scrollSpeed }) => {
			writeStorage('settings', { cursorSpeed, scrollSpeed });
			context.touchPad.options.cursorSpeed = cursorSpeed;
			context.touchPad.options.scrollSpeed = scrollSpeed;
		},
	});
