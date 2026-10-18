import { hotReload } from '@vanilla-bean/components/app';

import { handleMessage } from './guard';
import router from './router';

export default {
	async init({ port, simulate, control }) {
		// Loaded only when no stand-in is given, so tests never reach the real mouse and keyboard
		const controls = control ?? (await import('./control')).default;

		const server = Bun.serve({
			port,
			fetch: (request, server) => (hotReload.upgrade(request, server) ? undefined : router(request, server)),
			websocket: {
				open: hotReload.websocket.open,
				close: hotReload.websocket.close,
				message(socket, buffer) {
					handleMessage(controls, buffer, { simulate });
				},
			},
		});

		console.log(`Listening on ${server.hostname}:${server.port}`);

		if (process.env.NODE_ENV === 'development') await hotReload.watch();

		return server;
	},
};
