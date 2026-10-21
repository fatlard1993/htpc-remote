import { nanoid } from 'nanoid';
import { requestMatch, serveStatic } from '@vanilla-bean/components/app';

import { foreignHost } from '../guard';

const router = async (request, server) => {
	let match;

	if (foreignHost(request)) return new Response('Unknown host', { status: 421 });

	match = requestMatch('GET', '/', request);
	if (match) return new Response(Bun.file('client/build/index.html'));

	match = requestMatch('GET', '/ws', request);
	if (match) {
		const success = server.upgrade(request, { data: { clientId: nanoid() } });

		return success ? undefined : new Response('WebSocket upgrade error', { status: 400 });
	}

	return serveStatic(request);
};
export default router;
