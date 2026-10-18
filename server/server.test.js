import { afterAll, beforeAll, expect, mock, test } from 'bun:test';
import { WebSocket } from 'ws';

import server from './server';

// Bun's ws client, not the test DOM's WebSocket: it sends the Origin header given, as another site's page would

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

afterAll(() => running.stop(true));

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

test("a socket from another site's page is refused", async () => {
	const { opened } = await connect('http://evil.example');

	expect(opened).toBe(false);
});
