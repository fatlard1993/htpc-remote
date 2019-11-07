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

var opts = yargs.argv;

opts.rootFolder = rootFolder;

delete opts._;
delete opts.$0;
delete opts.v;
delete opts.p;
delete opts.s;

opts.verbosity = Number(opts.verbosity);

//log args polyfill
process.env.DBG = opts.verbosity;
process.env.COLOR = true;

const log = require('log');

log(1)(opts);

(require('./htpcRemote')).init(opts);