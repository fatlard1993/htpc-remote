#!/usr/bin/env node

const path = require('path');
const { exec } = require('child_process');

const args = require('yargs').argv;
const log = require('log');
const ConfigManager = require('config-manager');
const findRoot = require('find-root');

const rootFolder = findRoot(process.cwd());

var config = new ConfigManager(path.join(rootFolder, 'config.json'), {
	port: 8080,
	sink: 1
});

const { app, sendPage, pageCompiler, staticServer } = require('http-server').init(args.port || config.current.port);
const SocketServer = require('websocket-server');

const socketServer = new SocketServer({ server: app.server });
const stdin = process.openStdin();

pageCompiler.buildFile('home');

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

socketServer.registerEndpoints({
	touchPadMove: function(position){
		log(`xdotool mousemove_relative -- ${position.x} ${position.y}`);

		if(!args.dev) exec(`xdotool mousemove_relative -- ${position.x} ${position.y}`);
	},
	touchPadScroll: function(scroll){
		if(scroll.y){
			log(`xdotool key ${scroll.y < 1 ? 'Down' : 'Up'}`);

			if(!args.dev) exec(`xdotool key ${scroll.y < 1 ? 'Down' : 'Up'}`);
		}

		if(scroll.x){
			log(`xdotool key ${scroll.x > 1 ? 'Left' : 'Right'}`);

			if(!args.dev) exec(`xdotool key ${scroll.x > 1 ? 'Left' : 'Right'}`);
		}
	},
	sendText: function(text){
		log(`xdotool type '${text}'`);

		if(!args.dev) exec(`xdotool type '${text}'`);
	},
	sendReturn: function(){
		log('xdotool key --clearmodifiers Return');

		if(!args.dev) exec('xdotool key --clearmodifiers Return');
	},
	sendCommand: function(command){
		log(`xdotool keydown ${command.mod} && xdotool key ${command.key} && sleep 0.1 && xdotool keyup ${command.mod}`);

		if(!args.dev) exec(`xdotool keydown ${command.mod} && xdotool key ${command.key} && sleep 0.1 && xdotool keyup ${command.mod}`);
	},
	rightMouseButton: function(){
		log('xdotool click --clearmodifiers 3');

		if(!args.dev) exec('xdotool click --clearmodifiers 3');
	},
	leftMouseButton: function(){
		log('xdotool click --clearmodifiers 1');

		if(!args.dev) exec('xdotool click --clearmodifiers 1');
	},
	volumeUp: function(amount){
		log(`pactl set-sink-volume ${config.current.sink} +${amount}%`);

		if(!args.dev) exec(`pactl set-sink-volume ${config.current.sink} +${amount}%`);
	},
	volumeDown: function(amount){
		log(`pactl set-sink-volume ${config.current.sink} -${amount}%`);

		if(!args.dev) exec(`pactl set-sink-volume ${config.current.sink} -${amount}%`);
	},
	volumeMute: function(){
		log(`pactl set-sink-mute ${config.current.sink}`);

		if(!args.dev) exec(`pactl set-sink-mute ${config.current.sink}`);
	}
});

stdin.addListener('data', function(data){
	var cmd = data.toString().trim();

	log(`CMD: ${cmd}`);
});