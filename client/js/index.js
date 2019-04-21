// includes dom log socket-client notify menu dialog
// babel
/* global dom log socketClient notify menu dialog */

dom.onLoad(function onLoad(){
	menu.init({
		main: ['Send Return', 'Send Text', 'OS', 'Volume', 'Settings'],
		os: ['< Back', 'Quit App', 'Launch App', 'Workspaces', 'Send Command'],
		workspaces: ['< Back', '1', '2', '3', '4', '5'],
		volume: ['< Back', 'Up', 'Down', 'Mute']
	});

	socketClient.init();

	dom.mobile.detect();

	if(!dom.storage.get('cursorSpeed')) dom.storage.set('cursorSpeed', 2);
	if(!dom.storage.get('scrollSpeed')) dom.storage.set('scrollSpeed', 20);

	socketClient.on('open', function(evt){
		log('socketClient open', evt);
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
					socketClient.reply('click', rightClick || (evt.targetTouches && evt.targetTouches.length === 2) ? 3 : 1);

					triggered = true;
				}

				document.removeEventListener('mouseup', touchPadDrop);
				document.removeEventListener('mousemove', touchPadMove);
				evt.target.removeEventListener('touchend', touchPadDrop);
				evt.target.removeEventListener('touchcancel', touchPadDrop);
				evt.target.removeEventListener('touchmove', touchPadMove);
			};

			document.addEventListener('mouseup', touchPadDrop);
			document.addEventListener('mousemove', touchPadMove);
			evt.target.addEventListener('touchend', touchPadDrop);
			evt.target.addEventListener('touchcancel', touchPadDrop);
			evt.target.addEventListener('touchmove', touchPadMove);
		}

		else if(dom.isMobile){
			evt.target.classList.add('active');

			if(evt.target.parentElement.id === 'menu'){
				evt.target.addEventListener('pointerleave', function menuItemLeave(evt){
					evt.target.classList.remove('active');

					evt.target.removeEventListener('pointerleave', menuItemLeave);
				});
			}
		}
	});

	dom.interact.on('pointerUp', function(evt){
		log('interact pointerUp', evt);

		if(evt.target.id === 'leftMouseButton'){
			evt.preventDefault();
			dom.interact.pointerTarget = null;

			socketClient.reply('click', 1);
		}

		else if(evt.target.id === 'rightMouseButton'){
			evt.preventDefault();
			dom.interact.pointerTarget = null;

			socketClient.reply('click', 3);
		}

		if(dom.isMobile) evt.target.classList.remove('active');
	});

	menu.on('selection', function(evt){
		log(this.isOpen, arguments);

		if(this.isOpen === 'os'){
			if(evt.item === '< Back') menu.open('main');

			else if(evt.item === 'Quit App') socketClient.reply('command', { mod: 'alt', key: 'q' });

			else if(evt.item === 'Launch App') socketClient.reply('command', { mod: 'alt', key: 'space' });

			else if(evt.item === 'Send Command'){
				menu.close();

				var wrapper = dom.createElem('div');
				var modifier = dom.createElem('input', dom.basicTextElem({ appendTo: dom.createElem('label', { textContent: 'Modifier', appendTo: wrapper }) }));
				var key = dom.createElem('input', dom.basicTextElem({ appendTo: dom.createElem('label', { textContent: 'Key', appendTo: wrapper }) }));

				dialog('sendCommand', 'Send Command', wrapper, 'Cancel|OK');

				dialog.resolve.sendCommand = function(choice){
					if(choice === 'Cancel') return;

					socketClient.reply('command', { mod: modifier.value, key: key.value });
				};
			}
		}

		else if(this.isOpen === 'workspaces'){
			if(evt.item === '< Back') menu.open('os');

			else socketClient.reply('command', { mod: 'alt', key: evt.item });
		}

		else if(this.isOpen === 'volume'){
			if(evt.item === '< Back') menu.open('main');

			else socketClient.reply('key', { Up: 'XF86AudioRaiseVolume', Down: 'XF86AudioLowerVolume', Mute: 'XF86AudioMute'}[evt.item]);
		}

		else if(evt.item === 'Send Text'){
			menu.close();

			dialog('sendText', 'Send Text', dom.createElem('input', dom.basicTextElem()), 'Cancel|OK');

			dialog.resolve.sendText = function(choice){
				if(choice === 'Cancel') return;

				socketClient.reply('type', dialog.active.content.children[0].value);
			};
		}

		else if(evt.item === 'Settings'){
			menu.close();

			var wrapper2 = dom.createElem('div');
			var cursorSpeed = dom.createElem('input', { type: 'number', value: dom.storage.get('cursorSpeed'), appendTo: dom.createElem('label', { textContent: 'Cursor Speed', appendTo: wrapper2 }) });
			var scrollSpeed = dom.createElem('input', { type: 'number', value: dom.storage.get('scrollSpeed'), appendTo: dom.createElem('label', { textContent: 'Scroll Speed', appendTo: wrapper2 }) });

			dialog('settings', 'Settings', wrapper2, 'Cancel|OK');

			dialog.resolve.settings = function(choice){
				if(choice === 'Cancel') return;

				dom.storage.set('cursorSpeed', parseFloat(cursorSpeed.value) || 1.5);
				dom.storage.set('scrollSpeed', parseFloat(scrollSpeed.value) || 30);
			};
		}

		else if(evt.item === 'Send Return') socketClient.reply('key', 'return');
	});
});