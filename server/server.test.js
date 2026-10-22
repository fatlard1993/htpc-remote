import { afterAll, beforeAll, expect, mock, test } from 'bun:test';

import server from './server';

const control = { type: mock() };
let running;
let base;

const connect = origin =>
	new Promise(resolve => {
		const socket = new WebSocket(`${base.replace('http', 'ws')}/ws`, { headers: { origin } });

		socket.addEventListener('open', () => resolve({ socket, opened: true }));
		socket.addEventListener('error', () => resolve({ socket, opened: false }));
	});

beforeAll(async () => {
	running = await server.init({ port: 0, control });
	base = `http://127.0.0.1:${running.port}`;
});

afterAll(() => {
	running.stop(true);
});

test("a socket from the remote's own page connects and drives its control", async () => {
	const { socket, opened } = await connect(base);

	expect(opened).toBe(true);

	socket.send('{not json');
	socket.send(JSON.stringify({ message: '__proto__', payload: {} }));
	socket.send(JSON.stringify({ message: 'type', payload: { text: 'hi' } }));
	await new Promise(resolve => setTimeout(resolve, 50));

	expect(control.type).toHaveBeenCalledTimes(1);
	expect(control.type).toHaveBeenCalledWith({ text: 'hi' });
	socket.close();
});

test('the page is revalidated on every load, so a phone never asks for chunks gone since the last deploy', async () => {
	const page = await fetch(`${base}/`);

	expect(page.status).toBe(200);
	expect(page.headers.get('cache-control')).toBe('no-cache');
});

test('a socket or write from another site\'s page, or from nowhere ("null"), is refused', async () => {
	for (const origin of ['http://evil.example', 'null']) expect((await connect(origin)).opened).toBe(false);

	const write = await fetch(`${base}/`, { method: 'POST', headers: { origin: 'http://evil.example' } });

	expect(write.status).toBe(403);
});
