#!/usr/bin/env node

const path = require('path');

const robot = require('robotjs');
const findRoot = require('find-root');
const rootFolder = findRoot(__dirname);

process.chdir(rootFolder);

const args = require('yargs').argv;
const log = require('log');
const Config = require('config-manager');

var config = new Config(path.join(rootFolder, 'config.json'), {
	port: 8080
});

const { app, sendPage, pageCompiler, staticServer } = require('http-server').init(args.port || config.current.port, rootFolder);
const SocketServer = require('websocket-server');

const socketServer = new SocketServer({ server: app.server });

pageCompiler.buildFile('index');

app.use('/resources', staticServer(path.join(rootFolder, 'client/resources')));

app.use('/fonts', staticServer(path.join(rootFolder, 'client/fonts')));

app.get('/home', sendPage('index'));

socketServer.registerEndpoints({
	touchPadMove: function(position){
		log(`move mouse -- ${position.x} ${position.y}`);

		var currentPosition = robot.getMousePos();

		if(!args.dev) robot.moveMouse(currentPosition.x + position.x, currentPosition.y + position.y);
	},
	touchPadScroll: function(scroll){
		if(scroll.y){
			log(`scroll ${scroll.y < 1 ? 'down' : 'up'} ${scroll.y}`);

			if(!args.dev) robot.scrollMouse(0, scroll.y);
		}

		if(scroll.x){
			log(`scroll ${scroll.x > 1 ? 'left' : 'right'} ${scroll.x}`);

			if(!args.dev) robot.scrollMouse(scroll.x, 0);
		}
	},
	type: function(text){
		log(`type '${text}'`);

		if(!args.dev) robot.typeString(text);
	},
	keyPress: function(evt){
		log(`key press${evt.mod ? ' mod: '+ evt.mod : ''} ${evt.key}`);

		if(!args.dev) robot.keyTap(evt.key, evt.mod);
	},
	keyDown: function(evt){
		log(`key down${evt.mod ? ' mod: '+ evt.mod : ''}${evt.key}`);

		if(!args.dev) robot.keyToggle(evt.key, 'down', evt.mod || []);
	},
	keyUp: function(evt){
		log(`key up${evt.mod ? ' mod: '+ evt.mod : ''}${evt.key}`);

		if(!args.dev) robot.keyToggle(evt.key, 'up', evt.mod || []);
	},
	mouseDown: function(button){
		log(`mouse down ${button}`);

		if(!args.dev) robot.mouseToggle('down', button);
	},
	mouseUp: function(button){
		log(`mouse up ${button}`);

		if(!args.dev) robot.mouseToggle('up', button);
	},
	click: function(button){
		log(`click ${button}`);

		if(!args.dev) robot.mouseClick(button);
	}
});