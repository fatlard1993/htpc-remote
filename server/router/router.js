import { nanoid } from 'nanoid';
import { requestMatch, serveStatic } from '@vanilla-bean/components/app';

import { crossOrigin, foreignHost } from '../guard';

const router = async (request, server) => {
	try {
		let match;

		if (foreignHost(request)) return new Response('Unknown host', { status: 421 });
		if (crossOrigin(request)) return new Response('Cross-origin request refused', { status: 403 });

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
