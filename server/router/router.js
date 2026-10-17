import { nanoid } from 'nanoid';
import { requestMatch, serveStatic } from '@vanilla-bean/components/app';

const router = async (request, server) => {
	try {
		let match;

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
