import { serve } from '@vanilla-bean/components/app';

import { handleMessage } from './guard';
import router from './router';

export default {
	async init({ port, simulate, control }) {
		// Loaded only when no stand-in is given, so tests never reach the real mouse and keyboard
		const controls = control ?? (await import('./control')).default;

		return serve({
			port,
			router,
			websocket: {
				message(socket, buffer) {
					handleMessage(controls, buffer, { simulate });
				},
			},
		});
	},
};
