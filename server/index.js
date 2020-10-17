#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const yargs = require('yargs');
const rootFolder = require('find-root')(__dirname);

function rootPath(){ return path.join(rootFolder, ...arguments); }

yargs.alias({
	h: 'help',
	ver: 'version',
	v: 'verbosity',
	p: 'port',
	s: 'simulate'
});

yargs.boolean(['h', 'ver', 's']);

yargs.default({
	v: 1,
	p: 80
});

yargs.describe({
	v: '<level>',
	p: '<port>',
	s: 'See what would happen, without making any changes'
});


const args = yargs.argv;

['_', '$0', 'v', 'p', 's'].forEach((item) => { delete args[item]; });

const opts = Object.assign(args, { args: Object.assign({}, args), rootFolder, verbosity: Number(args.verbosity) });

const log = new (require('log'))({ tag: 'htpc-remote', color: true, verbosity: opts.verbosity });

log(1)('Options', opts);

(require('./htpcRemote')).init(opts);