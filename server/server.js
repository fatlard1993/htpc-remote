import { hotReload } from '@vanilla-bean/components/app';

import control from './control';
import router from './router';

export default {
	async init({ port, simulate }) {
		const server = Bun.serve({
			port,
			fetch: (request, server) => (hotReload.upgrade(request, server) ? undefined : router(request, server)),
			websocket: {
				open: hotReload.websocket.open,
				close: hotReload.websocket.close,
				message(socket, buffer) {
					const { message, payload } = JSON.parse(buffer);

					console.log({ message, payload });

					if (simulate) console.log('SIMULATE', { message, payload });
					else if (control[message]) {
						try {
							control[message](payload);
						} catch (error) {
							console.error(error);
						}
					}
				},
			},
		});

		console.log(`Listening on ${server.hostname}:${server.port}`);

		if (process.env.NODE_ENV === 'development') await hotReload.watch();
	},
};
