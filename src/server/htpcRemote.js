const path = require('path');

const log = new (require('log'))({ tag: 'htpc-remote' });
const robot = require('robotjs');

const htpcRemote = {
	rootPath: function(){ return path.join(__dirname, '../..', ...arguments); },
	init: function(options){
		this.options = options;

		const { app } = require('http-server').init(options.port, this.rootPath(), '/');

		require('./router');

		const socketServer = new (require('websocket-server'))({ server: app.server });

		socketServer.registerEndpoints(this.socketEndpoints);

		log('Initialized htpcRemote');
	},
	socketEndpoints: {
		touchPadMove: function(position){
			log(htpcRemote.options.simulate ? 0 : 1)(`move mouse -- ${position.x} ${position.y}`);

			var currentPosition = robot.getMousePos();

			if(!htpcRemote.options.simulate) robot.moveMouse(currentPosition.x + position.x, currentPosition.y + position.y);
		},
		touchPadScroll: function(scroll){
			if(scroll.y){
				log(htpcRemote.options.simulate ? 0 : 1)(`scroll ${scroll.y < 1 ? 'down' : 'up'} ${scroll.y}`);

				if(!htpcRemote.options.simulate) robot.scrollMouse(0, scroll.y);
			}

			if(scroll.x){
				log(htpcRemote.options.simulate ? 0 : 1)(`scroll ${scroll.x > 1 ? 'left' : 'right'} ${scroll.x}`);

				if(!htpcRemote.options.simulate) robot.scrollMouse(scroll.x, 0);
			}
		},
		type: function(text){
			log(htpcRemote.options.simulate ? 0 : 1)(`type '${text}'`);

			if(!htpcRemote.options.simulate) robot.typeString(text);
		},
		keyPress: function(evt){
			log(htpcRemote.options.simulate ? 0 : 1)(`key press ${evt.mod ? ' mod: '+ evt.mod : ''} ${evt.key}`);

			if(!htpcRemote.options.simulate) robot.keyTap(evt.key, evt.mod);
		},
		keyDown: function(evt){
			log(htpcRemote.options.simulate ? 0 : 1)(`key down ${evt.mod ? ' mod: '+ evt.mod : ''}${evt.key}`);

			if(!htpcRemote.options.simulate) robot.keyToggle(evt.key, 'down', evt.mod || []);
		},
		keyUp: function(evt){
			log(htpcRemote.options.simulate ? 0 : 1)(`key up ${evt.mod ? ' mod: '+ evt.mod : ''}${evt.key}`);

			if(!htpcRemote.options.simulate) robot.keyToggle(evt.key, 'up', evt.mod || []);
		},
		mouseDown: function(button){
			log(htpcRemote.options.simulate ? 0 : 1)(`mouse down ${button}`);

			if(!htpcRemote.options.simulate) robot.mouseToggle('down', button);
		},
		mouseUp: function(button){
			log(htpcRemote.options.simulate ? 0 : 1)(`mouse up ${button}`);

			if(!htpcRemote.options.simulate) robot.mouseToggle('up', button);
		},
		click: function(button){
			log(htpcRemote.options.simulate ? 0 : 1)(`click ${button}`);

			if(!htpcRemote.options.simulate) robot.mouseClick(button);
		}
	}
};

module.exports = htpcRemote;