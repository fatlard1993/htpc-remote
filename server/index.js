#!/usr/bin/env node

const path = require('path');
const { exec } = require('child_process');

const args = require('yargs').argv;
const log = require('log');
const ConfigManager = require('config-manager');

var config = new ConfigManager(path.resolve('./config.json'), {
	port: 8080
});

const { app, sendPage, pageCompiler, staticServer } = require('http-server').init(args.port || config.current.port);
const SocketServer = require('websocket-server');

const socketServer = new SocketServer({ server: app.server });
const stdin = process.openStdin();

app.get('/testj', function(req, res){
	log('Testing JSON...');

	res.json({ test: 1 });
});

app.get('/test', function(req, res){
	log('Testing...');

	res.send('test');
});

app.use('/resources', staticServer(path.join(__dirname, '../client/resources')));

app.use('/fonts', staticServer(path.join(__dirname, '../client/fonts')));

app.get('/home', sendPage('home'));

socketServer.createEndpoint('touchPadMove', function(position){
	exec(`xdotool mousemove_relative ${position.x} ${position.y}`);
});

socketServer.createEndpoint('rightMouseButton', function(){
	exec('xdotool click --clearmodifiers 3');
});

socketServer.createEndpoint('leftMouseButton', function(){
	exec('xdotool click --clearmodifiers 1');
});

stdin.addListener('data', function(data){
	var cmd = data.toString().trim();

	log(`CMD: ${cmd}`);
});