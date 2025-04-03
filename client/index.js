import process from 'process';
import { Page, Elem, Component, rootContext, removeExcessIndentation } from 'vanilla-bean-components';

import View from './View';

import './socket';

window.process = process;

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
				background: ${theme.colors.black.setAlpha(0.5)};
			`,
		});
	}

	log(...args) {
		this.prepend(new LogLine({ line: args.length === 1 ? args[0] : args }));
	}

	info(...args) {
		this.prepend(new LogLine({ line: args.length === 1 ? args[0] : args, color: 'blue' }));
	}

	warn(...args) {
		this.prepend(new LogLine({ line: args.length === 1 ? args[0] : args, color: 'yellow' }));
	}

	error(...args) {
		this.prepend(new LogLine({ line: args.length === 1 ? args[0] : args, color: 'red' }));
	}
}

rootContext.console = new Console();

// If device is touch-primary
if (matchMedia('(hover: none), (pointer: coarse)').matches) window.console = rootContext.console;

new Page({ appendTo: document.body, content: [rootContext.console, new View()] });
