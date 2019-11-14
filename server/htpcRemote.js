const fs = require('fs');
const path = require('path');

const log = require('log');
const robot = require('robotjs');

const htpcRemote = {
	init: function(opts){
		this.rootPath = function rootPath(){ return path.join(opts.rootFolder, ...arguments); };
		this.opts = opts;

		const { app, staticServer } = require('http-server').init(opts.port, opts.rootFolder);
		const socketServer = new (require('websocket-server'))({ server: app.server });

		app.use('/resources', staticServer(this.rootPath('client/resources')));

		app.use('/fonts', staticServer(this.rootPath('client/fonts')));

		if(fs.existsSync(this.rootPath('node_modules/font-awesome/src/fonts'))) app.use('/fonts', staticServer(this.rootPath('node_modules/font-awesome/src/fonts')));

		else if(fs.existsSync(this.rootPath('../node_modules/font-awesome/src/fonts'))) app.use('/fonts', staticServer(this.rootPath('../node_modules/font-awesome/src/fonts')));

		app.get('/home', function(req, res, next){
			res.sendPage('index');
		});

		socketServer.registerEndpoints(this.socketEndpoints);

		log('Initialized htpcRemote');
	},
	socketEndpoints: {
		touchPadMove: function(position){
			log(htpcRemote.opts.simulate ? 0 : 1)(`[htpc-remote] move mouse -- ${position.x} ${position.y}`);

			var currentPosition = robot.getMousePos();

			if(!htpcRemote.opts.simulate) robot.moveMouse(currentPosition.x + position.x, currentPosition.y + position.y);
		},
		touchPadScroll: function(scroll){
			if(scroll.y){
				log(htpcRemote.opts.simulate ? 0 : 1)(`[htpc-remote] scroll ${scroll.y < 1 ? 'down' : 'up'} ${scroll.y}`);

				if(!htpcRemote.opts.simulate) robot.scrollMouse(0, scroll.y);
			}

			if(scroll.x){
				log(htpcRemote.opts.simulate ? 0 : 1)(`[htpc-remote] scroll ${scroll.x > 1 ? 'left' : 'right'} ${scroll.x}`);

				if(!htpcRemote.opts.simulate) robot.scrollMouse(scroll.x, 0);
			}
		},
		type: function(text){
			log(htpcRemote.opts.simulate ? 0 : 1)(`[htpc-remote] type '${text}'`);

			if(!htpcRemote.opts.simulate) robot.typeString(text);
		},
		keyPress: function(evt){
			log(htpcRemote.opts.simulate ? 0 : 1)(`[htpc-remote] key press ${evt.mod ? ' mod: '+ evt.mod : ''} ${evt.key}`);

			if(!htpcRemote.opts.simulate) robot.keyTap(evt.key, evt.mod);
		},
		keyDown: function(evt){
			log(htpcRemote.opts.simulate ? 0 : 1)(`[htpc-remote] key down ${evt.mod ? ' mod: '+ evt.mod : ''}${evt.key}`);

			if(!htpcRemote.opts.simulate) robot.keyToggle(evt.key, 'down', evt.mod || []);
		},
		keyUp: function(evt){
			log(htpcRemote.opts.simulate ? 0 : 1)(`[htpc-remote] key up ${evt.mod ? ' mod: '+ evt.mod : ''}${evt.key}`);

			if(!htpcRemote.opts.simulate) robot.keyToggle(evt.key, 'up', evt.mod || []);
		},
		mouseDown: function(button){
			log(htpcRemote.opts.simulate ? 0 : 1)(`[htpc-remote] mouse down ${button}`);

			if(!htpcRemote.opts.simulate) robot.mouseToggle('down', button);
		},
		mouseUp: function(button){
			log(htpcRemote.opts.simulate ? 0 : 1)(`[htpc-remote] mouse up ${button}`);

			if(!htpcRemote.opts.simulate) robot.mouseToggle('up', button);
		},
		click: function(button){
			log(htpcRemote.opts.simulate ? 0 : 1)(`[htpc-remote] click ${button}`);

			if(!htpcRemote.opts.simulate) robot.mouseClick(button);
		}
	}
};

module.exports = htpcRemote;