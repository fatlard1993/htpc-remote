// includes dom log socket-client notify menu dialog
// babel
/* global dom log socketClient notify menu dialog */

dom.onLoad(function onLoad(){
	menu.init({
		main: ['Send Return', 'Send Text', 'Send Command', 'Volume', 'Settings'],
		volume: ['< Back', 'Up', 'Down', 'Mute']
	});

	notify.init();

	dialog.init();

	socketClient.init();

	if(!dom.storage.get('cursorSpeed')) dom.storage.set('cursorSpeed', 1.5);
	if(!dom.storage.get('scrollSpeed')) dom.storage.set('scrollSpeed', 30);
	if(!dom.storage.get('volumeMod')) dom.storage.set('volumeMod', 10);

	socketClient.on('open', function(evt){
		log('socketClient open', evt);

		socketClient.reply('type', 'payload');
	});

	socketClient.on('error', function(evt){
		log('socketClient error', evt);
	});

	socketClient.on('message', function(evt){
		log('socketClient message', evt);
	});

	socketClient.on('close', function(evt){
		log('socketClient close', evt);

		socketClient.reconnect();
	});

	dom.interact.on('pointerDown', function(evt){
		log('interact pointerDown', evt);

		if(evt.target.id === 'touchPad' && (!evt.targetTouches || (evt.targetTouches && evt.targetTouches.length === 1))){
			dom.interact.pointerTarget = null;

			var resolvePosition = function(evt){
				return {
					x: (evt.targetTouches) ? evt.targetTouches[0].pageX : evt.clientX,
					y: (evt.targetTouches) ? evt.targetTouches[0].pageY : evt.clientY
				};
			};

			var getPositionDifference = function(position1, position2, multiplier){
				return {
					x: Math.round((position1.x - position2.x) * multiplier),
					y: Math.round((position1.y - position2.y) * multiplier)
				};
			};

			var getScrollDirections = function(position, speed){
				return {
					x: (Math.abs(position.x) > speed) ? position.x : 0,
					y: (Math.abs(position.y) > speed) ? position.y : 0
				};
			};

			var lastPosition, moved, rightClick, triggered, newPosition, positionDifference;
			var multiplier = parseFloat(dom.storage.get('cursorSpeed'));
			var scrollSpeed = parseFloat(dom.storage.get('scrollSpeed'));

			var touchPadMove = function(evt){
				evt.preventDefault();

				newPosition = resolvePosition(evt);

				if(!lastPosition) lastPosition = newPosition;

				positionDifference = getPositionDifference(newPosition, lastPosition, multiplier);

				rightClick = evt.which === 3 || (evt.targetTouches && evt.targetTouches.length === 2);

				if(Math.abs(positionDifference.x) <= (rightClick ? scrollSpeed : 0) && Math.abs(positionDifference.y) <= (rightClick ? scrollSpeed : 0)) return;

				socketClient.reply(rightClick ? 'touchPadScroll' : 'touchPadMove', rightClick ? getScrollDirections(positionDifference, scrollSpeed) : positionDifference);

				lastPosition = newPosition;

				moved = true;
			};

			var touchPadDrop = function(evt){
				evt.preventDefault();

				if(!triggered && !moved){
					socketClient.reply(rightClick || (evt.targetTouches && evt.targetTouches.length === 2) ? 'rightMouseButton' : 'leftMouseButton');

					triggered = true;
				}

				document.removeEventListener('mouseup', touchPadDrop);
				document.removeEventListener('mousemove', touchPadMove);
				evt.target.removeEventListener('touchend', touchPadDrop);
				evt.target.removeEventListener('touchmove', touchPadMove);
			};

			document.addEventListener('mouseup', touchPadDrop);
			document.addEventListener('mousemove', touchPadMove);
			evt.target.addEventListener('touchend', touchPadDrop);
			evt.target.addEventListener('touchmove', touchPadMove);
		}
	});

	dom.interact.on('pointerUp', function(evt){
		log('interact pointerUp', evt);

		if(evt.target.id === 'leftMouseButton'){
			evt.preventDefault();
			dom.interact.pointerTarget = null;

			socketClient.reply('leftMouseButton');
		}

		else if(evt.target.id === 'rightMouseButton'){
			evt.preventDefault();
			dom.interact.pointerTarget = null;

			socketClient.reply('rightMouseButton');
		}
	});

	menu.on('selection', function(evt){
		log(this.isOpen, arguments);

		if(this.isOpen === 'volume'){
			if(evt.item === '< Back') menu.open('main');

			else socketClient.reply(`volume${evt.item}`, dom.storage.get('volumeMod'));
		}

		else if(evt.item === 'Send Text'){
			menu.close();

			dialog('sendText', 'Send Text', dom.createElem('input', { type: 'text' }), 'Cancel|OK');

			dialog.resolve.sendText = function(choice){
				if(choice === 'Cancel') return;

				socketClient.reply('sendText', dialog.active.content.children[0].value);
			};
		}

		else if(evt.item === 'Send Command'){
			menu.close();

			var wrapper = dom.createElem('div');
			var modifier = dom.createElem('input', { type: 'text', appendTo: dom.createElem('label', { textContent: 'Modifier', appendTo: wrapper }) });
			var key = dom.createElem('input', { type: 'text', appendTo: dom.createElem('label', { textContent: 'Key', appendTo: wrapper }) });

			dialog('sendCommand', 'Send Command', wrapper, 'Cancel|OK');

			dialog.resolve.sendCommand = function(choice){
				if(choice === 'Cancel') return;

				socketClient.reply('sendCommand', { mod: modifier.value, key: key.value });
			};
		}

		else if(evt.item === 'Settings'){
			menu.close();

			var wrapper2 = dom.createElem('div');
			var cursorSpeed = dom.createElem('input', { type: 'number', value: dom.storage.get('cursorSpeed'), appendTo: dom.createElem('label', { textContent: 'Cursor Speed', appendTo: wrapper2 }) });
			var scrollSpeed = dom.createElem('input', { type: 'number', value: dom.storage.get('scrollSpeed'), appendTo: dom.createElem('label', { textContent: 'Scroll Speed', appendTo: wrapper2 }) });
			var volumeMod = dom.createElem('input', { type: 'number', value: dom.storage.get('volumeMod'), appendTo: dom.createElem('label', { textContent: 'Volume Modifier', appendTo: wrapper2 }) });

			dialog('settings', 'Settings', wrapper2, 'Cancel|OK');

			dialog.resolve.settings = function(choice){
				if(choice === 'Cancel') return;

				dom.storage.set('cursorSpeed', parseFloat(cursorSpeed.value) || 1.5);
				dom.storage.set('scrollSpeed', parseFloat(scrollSpeed.value) || 30);
				dom.storage.set('volumeMod', parseFloat(volumeMod.value) || 10);
			};
		}

		else if(evt.item === 'Send Return') socketClient.reply('sendReturn');
	});
});