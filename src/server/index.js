#!/usr/bin/env node

const argi = require('argi');

argi.parse({
	verbosity: {
		type: 'int',
		alias: 'v',
		defaultValue: 1
	},
	port: {
		type: 'int',
		alias: 'p',
		defaultValue: 8793
	},
	simulate: {
		type: 'boolean',
		alias: 's',
		description: 'See what would happen, without making any changes'
	}
});

const options = argi.options.named;
const log = new (require('log'))({ tag: 'htpc-remote', defaults: { verbosity: options.verbosity, color: true } });

log(1)('Options', options);

require('./htpcRemote').init(options);