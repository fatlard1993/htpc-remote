import { nanoid } from 'nanoid';
import { requestMatch, sameOrigin, serveStatic } from '@vanilla-bean/components/app';

import { foreignHost } from '../guard';

const router = async (request, server) => {
	try {
		let match;

		if (foreignHost(request)) return new Response('Unknown host', { status: 421 });
		// Socket upgrades and writes from another site's page carry that site's Origin; WebSockets get no CORS protection,
		// so without this any page a browser on the network visits could connect and type on this machine
		if (!sameOrigin(request)) return new Response('Cross-origin request refused', { status: 403 });

		match = requestMatch('GET', '/', request);
		if (match) return new Response(Bun.file('client/build/index.html'));

		match = requestMatch('GET', '/ws', request);
		if (match) {
			const success = server.upgrade(request, { data: { clientId: nanoid() } });

			return success ? undefined : new Response('WebSocket upgrade error', { status: 400 });
		}

		return (await serveStatic(request)) ?? new Response('Not Found', { status: 404 });
	} catch (error) {
		console.error('An error was encountered processing a request\n', error);

		return new Response('Server Error', { status: 500 });
	}
};
export default router;
