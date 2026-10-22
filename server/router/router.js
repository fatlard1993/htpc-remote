import { nanoid } from 'nanoid';
import { requestMatch, serveApp } from '@vanilla-bean/components/app';

import { foreignHost } from '../guard';

const router = async (request, server) => {
	if (foreignHost(request)) return new Response('Unknown host', { status: 421 });

	if (requestMatch('GET', '/ws', request)) {
		const success = server.upgrade(request, { data: { clientId: nanoid() } });

		return success ? undefined : new Response('WebSocket upgrade error', { status: 400 });
	}

	return serveApp(request, { api: false });
};

export default router;
