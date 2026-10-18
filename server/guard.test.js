import { hostname } from 'os';
import { describe, expect, mock, test } from 'bun:test';

import { crossOrigin, foreignHost, handleMessage } from './guard';
import router from './router';

// Shaped like a request rather than built as one: the test DOM's Request drops Host and Origin, which are what's checked
const request = (headers, { method = 'GET', path = '/' } = {}) => ({
	method,
	url: `http://${headers.host ?? 'remote.test'}${path}`,
	headers: { get: name => headers[name] ?? null },
});

describe('foreignHost', () => {
	test('an address, localhost or this machine by any local suffix is home', () => {
		const machine = hostname().split('.')[0];

		for (const host of [
			'192.168.1.20:8793',
			'127.0.0.1',
			'[::1]:8793',
			'localhost:8793',
			machine,
			`${machine}.local`,
		]) {
			expect(foreignHost(request({ host }))).toBe(false);
		}
	});

	test('any other name, as a rebound DNS name would be, is refused', async () => {
		expect(foreignHost(request({ host: 'evil.example:8793' }))).toBe(true);
		expect((await router(request({ host: 'evil.example:8793' }))).status).toBe(421);
	});
});

describe('crossOrigin', () => {
	const host = '192.168.1.20:8793';

	test("an upgrade or write from this page's own origin passes", () => {
		expect(crossOrigin(request({ host, origin: `http://${host}`, upgrade: 'websocket' }))).toBe(false);
		expect(crossOrigin(request({ host, origin: `http://${host}` }, { method: 'POST' }))).toBe(false);
	});

	test("an upgrade or write from another site's page is refused", async () => {
		const upgrade = request({ host, origin: 'http://evil.example', upgrade: 'websocket' }, { path: '/ws' });

		expect(crossOrigin(upgrade)).toBe(true);
		expect(crossOrigin(request({ host, origin: 'http://evil.example' }, { method: 'POST' }))).toBe(true);
		expect(crossOrigin(request({ host, origin: 'null', upgrade: 'websocket' }))).toBe(true);
		expect((await router(upgrade, { upgrade: () => true })).status).toBe(403);
	});

	test('a plain read from anywhere passes; it changes nothing', () => {
		expect(crossOrigin(request({ host, origin: 'http://evil.example' }))).toBe(false);
	});
});

describe('handleMessage', () => {
	const controls = () => ({ heldKeys: {}, type: mock() });

	test('a message naming a control runs it with the payload', () => {
		const control = controls();

		expect(handleMessage(control, JSON.stringify({ message: 'type', payload: { text: 'hi' } }))).toBe(true);
		expect(control.type).toHaveBeenCalledWith({ text: 'hi' });
	});

	test('malformed messages are dropped, not thrown', () => {
		const control = controls();

		for (const buffer of ['{not json', 'null', '"type"', JSON.stringify({ message: 42 })]) {
			expect(handleMessage(control, buffer)).toBe(false);
		}
		expect(control.type).not.toHaveBeenCalled();
	});

	test("only control's own functions can be called", () => {
		const control = controls();

		for (const message of ['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'heldKeys']) {
			expect(handleMessage(control, JSON.stringify({ message, payload: {} }))).toBe(false);
		}
	});

	test('simulate logs instead of acting', () => {
		const control = controls();

		expect(
			handleMessage(control, JSON.stringify({ message: 'type', payload: { text: 'x' } }), { simulate: true }),
		).toBe(true);
		expect(control.type).not.toHaveBeenCalled();
	});
});
