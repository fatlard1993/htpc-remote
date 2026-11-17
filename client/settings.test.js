import { afterAll, beforeAll, expect, test } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

let library;
let context;
let openSettings;

beforeAll(async () => {
	GlobalRegistrator.register({ url: 'http://localhost/' });

	library = await import('@vanilla-bean/components');
	context = (await import('./context.js')).default;
	({ openSettings } = await import('./settings.js'));
});

afterAll(() => GlobalRegistrator.unregister());

test('a speed is saved as the number typed, not its text', async () => {
	context.touchPad = { options: {} };

	const dialog = openSettings();
	const field = dialog.elem.querySelector('input[type="number"]');

	field.value = '3.5';
	field.dispatchEvent(new Event('change', { bubbles: true }));
	[...dialog.elem.querySelectorAll('button')].find(button => button.textContent.trim() === 'Save').click();
	await new Promise(resolve => setTimeout(resolve, 20));

	expect(library.readStorage('settings').cursorSpeed).toBe(3.5);
	expect(context.touchPad.options.cursorSpeed).toBe(3.5);
});

test('an emptied speed is refused, not saved', async () => {
	library.writeStorage('settings', { cursorSpeed: 1, scrollSpeed: 2 });
	context.touchPad = { options: {} };

	const dialog = openSettings();
	const field = dialog.elem.querySelector('input[type="number"]');

	field.value = '';
	field.dispatchEvent(new Event('change', { bubbles: true }));
	[...dialog.elem.querySelectorAll('button')].find(button => button.textContent.trim() === 'Save').click();
	await new Promise(resolve => setTimeout(resolve, 20));

	expect(library.readStorage('settings').cursorSpeed).toBe(1);
	expect(context.touchPad.options.cursorSpeed).toBeUndefined();
	expect(dialog.elem.textContent).toContain('Must be a number above 0, up to 99');
});
