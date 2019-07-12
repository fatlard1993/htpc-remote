// includes dom log socket-client menu dialog
// babel
/* global dom log socketClient menu dialog */

socketClient.stayConnected = function(){
	if(socketClient.status === 'open') return;

	var reload = 'soft';

	if(reload === 'soft' && dom.triedSoftReload) reload = 'hard';

	log()(`Reload: ${reload}`);

	if(reload === 'hard') return window.location.reload(false);

	socketClient.reconnect();

	dom.triedSoftReload = true;

	dom.resetSoftReset_TO = setTimeout(function(){ dom.triedSoftReload = false; }, 4000);
};

const htpcRemote = {
	load: function(){
		menu.init({
			main: ['Keyboard', 'OS', 'Volume', 'Settings'],
			os: ['< Back', 'Quit App', 'Launch App', 'Workspaces', 'Send Command'],
			workspaces: ['< Back', '1', '2', '3', '4', '5'],
			volume: ['< Back', 'Up', 'Down', 'Mute']
		});

		socketClient.init();

		dom.mobile.detect();

		if(!dom.storage.get('cursorSpeed')) dom.storage.set('cursorSpeed', 2);
		if(!dom.storage.get('scrollSpeed')) dom.storage.set('scrollSpeed', 30);

		dom.interact.on('pointerUp', htpcRemote.onPointerUp);
		dom.interact.on('keyUp', htpcRemote.onKeyUp);

		menu.on('selection', htpcRemote.onMenuSelection);

		document.addEventListener('mousedown', htpcRemote.onPointerDown);
		document.addEventListener('touchstart', htpcRemote.onPointerDown);
	},
	onPointerDown: function(evt){
		log('interact pointerDown', evt);

		socketClient.stayConnected();

		if(evt.target.id === 'touchPad' && (!evt.targetTouches || (evt.targetTouches && evt.targetTouches.length === 1))){
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

				if(!evt.targetTouches){
					document.removeEventListener('mousemove', touchPadMove);
					document.removeEventListener('mouseup', touchPadDrop);
				}

				else{
					document.removeEventListener('touchmove', touchPadMove);
					document.removeEventListener('touchend', touchPadDrop);
					document.removeEventListener('touchcancel', touchPadDrop);
				}
			};

			if(!evt.targetTouches){
				document.addEventListener('mousemove', touchPadMove);
				document.addEventListener('mouseup', touchPadDrop);
			}

			else{
				document.addEventListener('touchmove', touchPadMove);
				document.addEventListener('touchend', touchPadDrop);
				document.addEventListener('touchcancel', touchPadDrop);
			}
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
	},
	onPointerUp: function(evt){
		log()('interact pointerUp', evt);

		if(evt.target.id === 'leftMouseButton'){
			evt.preventDefault();

			socketClient.reply('click', 1);
		}

		else if(evt.target.id === 'rightMouseButton'){
			evt.preventDefault();

			socketClient.reply('click', 3);
		}

		else if(evt.target.id === 'menuButton'){
			evt.preventDefault();

			menu.open('main');
		}

		else if(evt.target.id === 'returnButton'){
			evt.preventDefault();

			socketClient.reply('key', 'Return');
		}

		else if(evt.target.id === 'escapeButton'){
			evt.preventDefault();

			socketClient.reply('key', 'Escape');
		}

		else if(evt.target.id === 'backspaceButton'){
			evt.preventDefault();

			socketClient.reply('key', 'BackSpace');
		}

		if(dom.isMobile) evt.target.classList.remove('active');
	},
	onKeyUp: function(evt){
		if(evt.target.id === 'typeInput'){
			evt.preventDefault();

			socketClient.reply('type', evt.target.value);

			evt.target.value = '';
		}
	},
	onMenuSelection: function(evt){
		log()(this.isOpen, arguments);
		if(evt.item === '< Back') menu.open({ os: 'main', volume: 'main', workspaces: 'os' }[menu.isOpen]);

		else if(this.isOpen === 'os'){
			if(evt.item === 'Quit App') socketClient.reply('command', { mod: 'Super_L', key: 'q' });

			else if(evt.item === 'Launch App') socketClient.reply('command', { mod: 'Super_L', key: 'space' });

			else if(evt.item === 'Send Command'){
				menu.close();

				var wrapper = dom.createElem('div');
				var modifier = dom.createElem('input', dom.basicTextElem({ appendTo: dom.createElem('label', { textContent: 'Modifier', appendTo: wrapper }) }));
				var key = dom.createElem('input', dom.basicTextElem({ appendTo: dom.createElem('label', { textContent: 'Key', appendTo: wrapper }) }));

				dialog('sendCommand', 'Send Command', wrapper, 2);

				dialog.resolve.sendCommand = function(choice){
					if(choice === 'Cancel') return;

					socketClient.reply('command', { mod: modifier.value, key: key.value });
				};
			}
		}

		else if(this.isOpen === 'workspaces') socketClient.reply('command', { mod: 'Super_L', key: evt.item });

		else if(this.isOpen === 'volume') socketClient.reply('key', { Up: 'XF86AudioRaiseVolume', Down: 'XF86AudioLowerVolume', Mute: 'XF86AudioMute'}[evt.item]);

		else if(evt.item === 'Keyboard'){
			menu.close();

			var typeInput = dom.createElem('input', dom.basicTextElem({ id: 'typeInput' }));
			var returnButton = dom.createElem('button', { textContent: 'Return', id: 'returnButton' });
			var escapeButton = dom.createElem('button', { textContent: 'Esc', id: 'escapeButton' });
			var backspaceButton = dom.createElem('button', { textContent: 'BackSpace', id: 'backspaceButton' });

			dialog('keyboard', 'Keyboard', dom.createElem('div', { appendChildren: [returnButton, typeInput, backspaceButton, escapeButton] }), 'Done');
		}

		else if(evt.item === 'Settings'){
			menu.close();

			var wrapper2 = dom.createElem('div');
			var cursorSpeed = dom.createElem('input', { type: 'number', value: dom.storage.get('cursorSpeed'), appendTo: dom.createElem('label', { textContent: 'Cursor Speed', appendTo: wrapper2 }) });
			var scrollSpeed = dom.createElem('input', { type: 'number', value: dom.storage.get('scrollSpeed'), appendTo: dom.createElem('label', { textContent: 'Scroll Speed', appendTo: wrapper2 }) });

			dialog('settings', 'Settings', wrapper2, 2);

			dialog.resolve.settings = function(choice){
				if(choice === 'Cancel') return;

				dom.storage.set('cursorSpeed', parseFloat(cursorSpeed.value) || 1.5);
				dom.storage.set('scrollSpeed', parseFloat(scrollSpeed.value) || 30);
			};
		}
	}
};

dom.onLoad(htpcRemote.load);