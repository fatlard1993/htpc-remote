#!/usr/bin/env node

const path = require('path');
const { exec } = require('child_process');

const findRoot = require('find-root');
const rootFolder = findRoot(__dirname);

process.chdir(rootFolder);

const args = require('yargs').argv;
const log = require('log');
const Config = require('config-manager');

var config = new Config(path.join(rootFolder, 'config.json'), {
	port: 8080,
	sink: 1
});

const { app, sendPage, pageCompiler, staticServer } = require('http-server').init(args.port || config.current.port, rootFolder);
const SocketServer = require('websocket-server');

const socketServer = new SocketServer({ server: app.server });
const stdin = process.openStdin();

pageCompiler.buildFile('index');

app.get('/testj', function(req, res){
	log('Testing JSON...');

	res.json({ test: 1 });
});

app.get('/test', function(req, res){
	log('Testing...');

	res.send('test');
});

app.use('/resources', staticServer(path.join(rootFolder, '../client/resources')));

app.use('/fonts', staticServer(path.join(rootFolder, '../client/fonts')));

app.get('/home', sendPage('index'));

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
	type: function(text){
		log(`xdotool type '${text}'`);

		if(!args.dev) exec(`xdotool type '${text}'`);
	},
	key: function(key){
		log(`xdotool key --clearmodifiers ${key}`);

		if(!args.dev) exec(`xdotool key --clearmodifiers ${key}`);
	},
	command: function(command){
		log(`xdotool keydown ${command.mod} && xdotool key ${command.key} && sleep 0.1 && xdotool keyup ${command.mod}`);

		if(!args.dev) exec(`xdotool keydown ${command.mod} && xdotool key ${command.key} && sleep 0.1 && xdotool keyup ${command.mod}`);
	},
	click: function(button){
		log(`xdotool click --clearmodifiers ${button}`);

		if(!args.dev) exec(`xdotool click --clearmodifiers ${button}`);
	}
});

stdin.addListener('data', function(data){
	var cmd = data.toString().trim();

	log(`CMD: ${cmd}`);
});