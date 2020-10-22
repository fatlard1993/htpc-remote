const fs = require('fs');
const path = require('path');

const log = new (require('log'))({ tag: 'htpc-remote' });
const robot = require('robotjs');

const htpcRemote = {
	init: function(opts){
		this.rootPath = function rootPath(){ return path.join(opts.rootFolder, ...arguments); };
		this.opts = opts;

		const fontAwesomePath = this.rootPath('node_modules/@fortawesome/fontawesome-free/webfonts');
		const { app, staticServer } = require('http-server').init(opts.port, opts.rootFolder);
		const socketServer = new (require('websocket-server'))({ server: app.server });

		app.use('/resources', staticServer(this.rootPath('client/resources')));

		app.use('/fonts', staticServer(this.rootPath('client/fonts')));

		if(fs.existsSync(fontAwesomePath)) app.use('/webfonts', staticServer(fontAwesomePath));

		app.get('/home', function(req, res, next){
			res.sendPage('index');
		});

		socketServer.registerEndpoints(this.socketEndpoints);

		log('Initialized htpcRemote');
	},
	socketEndpoints: {
		touchPadMove: function(position){
			log(htpcRemote.opts.simulate ? 0 : 1)(`move mouse -- ${position.x} ${position.y}`);

			var currentPosition = robot.getMousePos();

			if(!htpcRemote.opts.simulate) robot.moveMouse(currentPosition.x + position.x, currentPosition.y + position.y);
		},
		touchPadScroll: function(scroll){
			if(scroll.y){
				log(htpcRemote.opts.simulate ? 0 : 1)(`scroll ${scroll.y < 1 ? 'down' : 'up'} ${scroll.y}`);

				if(!htpcRemote.opts.simulate) robot.scrollMouse(0, scroll.y);
			}

			if(scroll.x){
				log(htpcRemote.opts.simulate ? 0 : 1)(`scroll ${scroll.x > 1 ? 'left' : 'right'} ${scroll.x}`);

				if(!htpcRemote.opts.simulate) robot.scrollMouse(scroll.x, 0);
			}
		},
		type: function(text){
			log(htpcRemote.opts.simulate ? 0 : 1)(`type '${text}'`);

			if(!htpcRemote.opts.simulate) robot.typeString(text);
		},
		keyPress: function(evt){
			log(htpcRemote.opts.simulate ? 0 : 1)(`key press ${evt.mod ? ' mod: '+ evt.mod : ''} ${evt.key}`);

			if(!htpcRemote.opts.simulate) robot.keyTap(evt.key, evt.mod);
		},
		keyDown: function(evt){
			log(htpcRemote.opts.simulate ? 0 : 1)(`key down ${evt.mod ? ' mod: '+ evt.mod : ''}${evt.key}`);

			if(!htpcRemote.opts.simulate) robot.keyToggle(evt.key, 'down', evt.mod || []);
		},
		keyUp: function(evt){
			log(htpcRemote.opts.simulate ? 0 : 1)(`key up ${evt.mod ? ' mod: '+ evt.mod : ''}${evt.key}`);

			if(!htpcRemote.opts.simulate) robot.keyToggle(evt.key, 'up', evt.mod || []);
		},
		mouseDown: function(button){
			log(htpcRemote.opts.simulate ? 0 : 1)(`mouse down ${button}`);

			if(!htpcRemote.opts.simulate) robot.mouseToggle('down', button);
		},
		mouseUp: function(button){
			log(htpcRemote.opts.simulate ? 0 : 1)(`mouse up ${button}`);

			if(!htpcRemote.opts.simulate) robot.mouseToggle('up', button);
		},
		click: function(button){
			log(htpcRemote.opts.simulate ? 0 : 1)(`click ${button}`);

			if(!htpcRemote.opts.simulate) robot.mouseClick(button);
		}
	}
};

module.exports = htpcRemote;