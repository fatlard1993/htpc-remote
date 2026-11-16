import { afterAll, afterEach, beforeAll, describe, expect, mock, test } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

let Keyboard;
let keyboard;

beforeAll(async () => {
	GlobalRegistrator.register({ url: 'http://localhost/' });

	const library = await import('@vanilla-bean/components');

	// No connection is made: a key that would be sent goes nowhere
	mock.module('@vanilla-bean/components', () => ({ ...library, connectSocket: () => ({ send: () => false }) }));

	({ default: Keyboard } = await import('./Keyboard'));
});

afterEach(() => keyboard.destroy());

afterAll(() => GlobalRegistrator.unregister());

const pressedLayoutKeys = () =>
	[...keyboard.elem.querySelectorAll('button[aria-pressed="true"]')].map(key => key.getAttribute('aria-label'));

const layoutKey = name => keyboard.elem.querySelector(`button.${name}`);

describe('the layout keys', () => {
	test('the key for the layout on screen is pressed, the others are not', () => {
		keyboard = new Keyboard({ appendTo: document.body, layout: 'media' });

		expect(pressedLayoutKeys()).toEqual(['Media keys']);
		expect(layoutKey('full').getAttribute('aria-pressed')).toBe('false');
	});

	test('pressing another moves it there', () => {
		keyboard = new Keyboard({ appendTo: document.body, layout: 'media' });

		layoutKey('basic').click();

		expect(keyboard.options.layout).toBe('basic');
		expect(pressedLayoutKeys()).toEqual(['Basic keyboard']);
	});

	test("a shifted layout is its keyboard's", () => {
		keyboard = new Keyboard({ appendTo: document.body, layout: 'full' });

		keyboard.setLayout('fullFakeShift');

		expect(pressedLayoutKeys()).toEqual(['Full keyboard', 'Shift']);
	});

	test('with the keyboard hidden, none of its layouts is on', () => {
		keyboard = new Keyboard({ appendTo: document.body, layout: 'media' });

		keyboard.setLayout('hide');

		expect(pressedLayoutKeys()).toEqual([]);
	});
});
