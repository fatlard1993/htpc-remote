import { Page, Elem, Component, removeExcessIndentation } from '@vanilla-bean/components';

import context from './context.js';

import View from './View';

import '@vanilla-bean/components/app/reloadOnBuild';

import './socket';

// Fix RegExp stringify-ability
RegExp.prototype.toJSON = RegExp.prototype.toString;

const stringifyValue = value => {
	if (typeof value === 'string') return value;

	const string = JSON.stringify(
		value,
		(_key, _value) => {
			if (value === undefined) return 'undefined';
			if (_value?.toString?.() === '[object Elem]') return '[object Elem]';
			if (typeof _value === 'object') {
				try {
					return JSON.stringify(_value, null, 2);
				} catch {
					if (_value instanceof Set) return '[object Set]';
					if (Array.isArray(_value)) return '[object Array]';
				}
			}
			if (typeof _value?.toString === 'function') return _value.toString();
			return _value;
		},
		2,
	);

	return removeExcessIndentation(
		(string || '')
			.replaceAll(String.raw`\t`, '\t')
			.replaceAll(String.raw`\n`, '\n')
			.replaceAll(String.raw`\"`, '"')
			.replaceAll(/^"|"$/g, ''),
	);
};

class LogLine extends Component {
	constructor(options) {
		super({
			...options,
			tag: 'pre',
			styles: theme => `
				margin: 1px;
				color: ${theme.colors[options.color || 'green']};
			`,
		});

		(Array.isArray(options.line) ? options.line : [options.line]).forEach(argument =>
			this.append(
				new Elem({
					tag: 'span',
					style: { marginRight: '12px' },
					textContent: typeof argument === 'string' ? argument : stringifyValue(argument),
				}),
			),
		);

		setTimeout(() => this.elem.remove(), 30 * 1000);
	}
}

// What logs while a line is being written goes to the browser's console: through the overlay, it would write another line, forever
const browserConsole = window.console;
let writing = false;

class Console extends Component {
	constructor(options = {}) {
		super({
			...options,
			styles: theme => `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				opacity: 0.4;
				z-index: 1;
				pointer-events: none;
				max-height: 42%;
				overflow: hidden;
				background: ${theme.colors.alpha(theme.colors.black, 0.5)};
			`,
		});
	}

	write(method, color, args) {
		if (writing) return browserConsole[method](...args);

		writing = true;

		try {
			this.prepend(new LogLine({ line: args.length === 1 ? args[0] : args, color }));
		} finally {
			writing = false;
		}
	}

	log(...args) {
		this.write('log', 'green', args);
	}

	info(...args) {
		this.write('info', 'blue', args);
	}

	warn(...args) {
		this.write('warn', 'yellow', args);
	}

	error(...args) {
		this.write('error', 'red', args);
	}
}

context.console = new Console();

// If device is touch-primary
if (matchMedia('(hover: none), (pointer: coarse)').matches) window.console = context.console;

new Page({ appendTo: document.body, content: [context.console, new View()] });
