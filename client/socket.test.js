import { afterAll, beforeAll, expect, mock, test } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

let hooks;

beforeAll(async () => {
	GlobalRegistrator.register({ url: 'http://localhost/' });

	const library = await import('@vanilla-bean/components');

	mock.module('@vanilla-bean/components', () => ({
		...library,
		connectSocket: (path, options) => {
			hooks = options;

			return { send: () => false };
		},
	}));

	await import('./socket');
});

afterAll(() => GlobalRegistrator.unregister());

test('a lost connection is said once, until it comes back', () => {
	hooks.onLost();
	hooks.onLost();

	expect(document.body.textContent.match(/Lost the connection/g)).toHaveLength(1);

	// Restored, the notice closes; the next outage says so afresh rather than leaning on the closed one
	hooks.onRestored();
	hooks.onLost();

	expect(document.body.textContent.match(/Lost the connection/g)).toHaveLength(2);
});
