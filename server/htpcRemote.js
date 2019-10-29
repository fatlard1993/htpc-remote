var log = require('log');
const robot = require('robotjs');

const htpcRemote = {
	init: function(config, socketServer){
		this.config = config;

		socketServer.registerEndpoints(this.socketEndpoints);

		log('Initialized htpcRemote');
	},
	socketEndpoints: {
		touchPadMove: function(position){
			log(htpcRemote.config.dev ? 0 : 1)(`move mouse -- ${position.x} ${position.y}`);

			var currentPosition = robot.getMousePos();

			if(!htpcRemote.config.dev) robot.moveMouse(currentPosition.x + position.x, currentPosition.y + position.y);
		},
		touchPadScroll: function(scroll){
			if(scroll.y){
				log(htpcRemote.config.dev ? 0 : 1)(`scroll ${scroll.y < 1 ? 'down' : 'up'} ${scroll.y}`);

				if(!htpcRemote.config.dev) robot.scrollMouse(0, scroll.y);
			}

			if(scroll.x){
				log(htpcRemote.config.dev ? 0 : 1)(`scroll ${scroll.x > 1 ? 'left' : 'right'} ${scroll.x}`);

				if(!htpcRemote.config.dev) robot.scrollMouse(scroll.x, 0);
			}
		},
		type: function(text){
			log(htpcRemote.config.dev ? 0 : 1)(`type '${text}'`);

			if(!htpcRemote.config.dev) robot.typeString(text);
		},
		keyPress: function(evt){
			log(htpcRemote.config.dev ? 0 : 1)(`key press${evt.mod ? ' mod: '+ evt.mod : ''} ${evt.key}`);

			if(!htpcRemote.config.dev) robot.keyTap(evt.key, evt.mod);
		},
		keyDown: function(evt){
			log(htpcRemote.config.dev ? 0 : 1)(`key down${evt.mod ? ' mod: '+ evt.mod : ''}${evt.key}`);

			if(!htpcRemote.config.dev) robot.keyToggle(evt.key, 'down', evt.mod || []);
		},
		keyUp: function(evt){
			log(htpcRemote.config.dev ? 0 : 1)(`key up${evt.mod ? ' mod: '+ evt.mod : ''}${evt.key}`);

			if(!htpcRemote.config.dev) robot.keyToggle(evt.key, 'up', evt.mod || []);
		},
		mouseDown: function(button){
			log(htpcRemote.config.dev ? 0 : 1)(`mouse down ${button}`);

			if(!htpcRemote.config.dev) robot.mouseToggle('down', button);
		},
		mouseUp: function(button){
			log(htpcRemote.config.dev ? 0 : 1)(`mouse up ${button}`);

			if(!htpcRemote.config.dev) robot.mouseToggle('up', button);
		},
		click: function(button){
			log(htpcRemote.config.dev ? 0 : 1)(`click ${button}`);

			if(!htpcRemote.config.dev) robot.mouseClick(button);
		}
	}
};

module.exports = htpcRemote;