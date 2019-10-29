#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const yargs = require('yargs');

yargs.version(false);

yargs.alias({
	h: 'help',
	c: 'color',
	ver: 'version',
	v: 'verbosity',
	p: 'port',
	dbg: 'debug',
	i: 'interval'
});

yargs.boolean(['h', 'c', 'ver']);

yargs.default({
	v: 1,
	i: 10
});

yargs.describe({
	h: 'This',
	c: 'Enables colored logs',
	ver: 'Wraps --color ... Prints the version then exits',
	v: '<level>',
	p: '<port>',
	dbg: 'Wraps --color --verbosity',
});

var args = yargs.argv;

if(args.n) args.dbg = args.n;

if(args.dbg){
	args.c = true;
	args.v = Number(args.dbg);
}

else if(args.v) args.v = Number(args.v);

//log args polyfill
process.env.DBG = args.v;
process.env.COLOR = args.ver || args.c;

const rootFolder = process.env.ROOT_FOLDER = require('find-root')(__dirname);

process.chdir(rootFolder);

var log = require('log');
const Config = require('config-manager');
const htpcRemote = require('./htpcRemote');

var config = new Config(path.join(rootFolder, 'config.json'), {
	port: 8080
});

config.dev = args.dev;

const { app, staticServer } = require('http-server').init(args.port || config.current.port, rootFolder);
const socketServer = new (require('websocket-server'))({ server: app.server });

app.use('/resources', staticServer(path.join(rootFolder, 'client/resources')));

app.use('/fonts', staticServer(path.join(rootFolder, 'client/fonts')));

app.get('/home', function(req, res, next){
	res.sendPage('index');
});

htpcRemote.init(config, socketServer);