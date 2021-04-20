#!/usr/bin/env node

const argi = require('argi');

const { options } = argi.parse({
	verbosity: {
		type: 'number',
		defaultValue: 1,
		alias: 'v',
	},
	port: {
		type: 'number',
		defaultValue: 8793,
		alias: 'p',
	},
	simulate: {
		type: 'boolean',
		description: 'See what would happen, without making any changes',
		alias: 's',
	}
});

const log = new (require('log'))({ tag: 'htpc-remote', defaults: { verbosity: options.verbosity, color: true } });

log(1)('Options', options);

require('./htpcRemote').init(options);