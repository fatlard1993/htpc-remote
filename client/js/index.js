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
		htpcRemote.menu.init();

		htpcRemote.touchPad.init();

		htpcRemote.keyboard.init();

		socketClient.init();

		dom.mobile.detect();

		dom.maintenance.init([htpcRemote.keyboard.fix]);

		if(!dom.storage.get('cursorSpeed')) dom.storage.set('cursorSpeed', 2);
		if(!dom.storage.get('scrollSpeed')) dom.storage.set('scrollSpeed', 30);

		dom.interact.on('pointerDown', socketClient.stayConnected);

		document.addEventListener('visibilitychange', () => {
			if(document.visibilityState) socketClient.stayConnected();
		});
	},
	tactileResponse: function(){
		if(!navigator.vibrate) return;

		navigator.vibrate(50);
	},
	menu: {
		items: {
			main: ['Keyboard', 'Volume', 'Quit App', 'Launch App', 'Settings'],
			volume: ['< Back', 'Up', 'Down', 'Mute']
		},
		init: function(){
			menu.init(htpcRemote.menu.items);

			menu.on('selection', htpcRemote.menu.onSelection);

			htpcRemote.menuButton = dom.getElemById('menuButton');

			dom.onPointerUp(htpcRemote.menuButton, function(evt){
				evt.stop();

				if(menu.isOpen) menu.close(1);

				else menu.open('main');
			});
		},
		onSelection: function(evt){
			log()(this.isOpen, arguments);

			htpcRemote.tactileResponse();

			if(evt.item === '< Back') menu.open('main');

			else if(this.isOpen === 'workspaces'){
				menu.close();

				socketClient.reply('command', { mod: 'Super_L', key: evt.item });
			}

			else if(this.isOpen === 'volume') socketClient.reply('key', { Up: 'XF86AudioRaiseVolume', Down: 'XF86AudioLowerVolume', Mute: 'XF86AudioMute'}[evt.item]);

			else if(evt.item === 'Keyboard'){
				menu.close();

				htpcRemote.keyboard[htpcRemote.keyboard.elem.classList.contains('disappear') ? 'show' : 'hide']();
			}

			if(evt.item === 'Quit App'){
				menu.close();

				socketClient.reply('command', { mod: 'Super_L', key: 'q' });
			}

			else if(evt.item === 'Launch App'){
				menu.close();

				socketClient.reply('command', { mod: 'Super_L', key: 'space' });

				htpcRemote.keyboard.show();
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
	},
	touchPad: {
		init: function(){
			htpcRemote.touchPad.elem = dom.getElemById('touchPad');

			dom.onPointerDown(htpcRemote.touchPad.elem, htpcRemote.touchPad.touchStart);
			dom.onPointerUp(htpcRemote.touchPad.elem, htpcRemote.touchPad.touchEnd);
		},
		getPositionDifference: function(position1, position2){
			return {
				x: Math.round((position1.x - position2.x) * htpcRemote.touchPad.multiplier),
				y: Math.round((position1.y - position2.y) * htpcRemote.touchPad.multiplier)
			};
		},
		getScrollDirections: function(position, speed){
			return {
				x: (Math.abs(position.x) > speed) ? position.x : 0,
				y: (Math.abs(position.y) > speed) ? position.y : 0
			};
		},
		touchStart: function(evt){
			if(evt.cancelable) evt.preventDefault();

			htpcRemote.touchPad.multiplier = parseFloat(dom.storage.get('cursorSpeed'));
			htpcRemote.touchPad.scrollSpeed = parseFloat(dom.storage.get('scrollSpeed'));

			document.addEventListener(`${evt.pointerType}move`, htpcRemote.touchPad.touchMove);
		},
		touchMove: function(evt){
			if(evt.cancelable) evt.preventDefault();

			var thisMoveTime = performance.now();

			if(thisMoveTime - htpcRemote.touchPad.lastMoveTime < 40) return;

			htpcRemote.touchPad.lastMoveTime = thisMoveTime;

			var newPosition = dom.resolvePosition(evt);

			if(!htpcRemote.touchPad.lastPosition) htpcRemote.touchPad.lastPosition = newPosition;

			var positionDifference = htpcRemote.touchPad.getPositionDifference(newPosition, htpcRemote.touchPad.lastPosition);

			htpcRemote.touchPad.rightClick = evt.which === 3 || (evt.targetTouches && evt.targetTouches.length === 2);

			if(Math.abs(positionDifference.x) <= (htpcRemote.touchPad.rightClick ? htpcRemote.touchPad.scrollSpeed : 0) && Math.abs(positionDifference.y) <= (htpcRemote.touchPad.rightClick ? htpcRemote.touchPad.scrollSpeed : 0)) return;

			socketClient.reply(htpcRemote.touchPad.rightClick  ? 'touchPadScroll' : 'touchPadMove', htpcRemote.touchPad.rightClick ? htpcRemote.touchPad.getScrollDirections(positionDifference, htpcRemote.touchPad.scrollSpeed) : positionDifference);

			htpcRemote.touchPad.lastPosition = newPosition;

			htpcRemote.touchPad.moved = true;
		},
		touchEnd: function(evt){
			evt.stop();

			if(!htpcRemote.touchPad.moved){
				htpcRemote.tactileResponse();

				socketClient.reply('click', htpcRemote.touchPad.rightClick || (evt.targetTouches && evt.targetTouches.length === 2) ? 3 : 1);
			}

			delete htpcRemote.touchPad.moved;
			delete htpcRemote.touchPad.rightClick;
			delete htpcRemote.touchPad.lastPosition;

			document.removeEventListener(`${evt.pointerType}move`, htpcRemote.touchPad.touchMove);
		}
	},
	keyboard: {
		layout: [
			['Esc', 'Tab', 'Shift', 'Ctrl', 'Mod',  'Alt', 'backspace'],
			['`:~:~', '[:~:{', ']:~:}', '\\:~:|', ';:~::', '\':~:"', ',:~:<', '.:~:>', '/:~:?', '-:~:_', '=:~:+'],
			['1:~:!', '2:~:@', '3:~:#', '4:~:$', '5:~:%', '6:~:^', '7:~:&', '8:~:*', '9:~:(', '0:~:)'],
			['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
			['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
			['z', 'x', 'c', 'v', 'b', 'n', 'm'],
			['Alternates', 'Space', 'return'],
			['left:~:home', 'up:~:pgUp', 'down:~:pgDown', 'right:~:End']
		],
		controlKeys: {
			Esc: 'Escape',
			Tab: 'Tab',
			Alt: 'Alt_L',
			backspace: 'BackSpace',
			Shift: 'Shift_L',
			Ctrl: 'Control_L',
			left: 'Left',
			up: 'Up',
			down: 'Down',
			right: 'Right',
			Mod: 'Super_L',
			home: 'Home',
			pgUp: 'Prior',
			pgDown: 'Next',
			End: 'End',
			Space: 'space',
			return: 'Return'
		},
		modifiers: {
			Alt: 1,
			Shift: 1,
			Ctrl: 1,
			Mod: 1
		},
		keys: [],
		init: function(){
			htpcRemote.keyboard.elem = dom.getElemById('keyboard');

			for(var x = 0, xCount = htpcRemote.keyboard.layout.length; x < xCount; ++x){
				var keyRow = dom.createElem('div', { appendTo: htpcRemote.keyboard.elem });

				for(var y = 0, yCount = htpcRemote.keyboard.layout[x].length; y < yCount; ++y){
					var keyText = htpcRemote.keyboard.layout[x][y].split(':~:')[0];

					var key = dom.createElem('button', {
						className: keyText,
						appendTo: keyRow,
						textContent: { backspace: 1, left: 1, up: 1, down: 1, right: 1, return: 1, pgUp: 1, pgDown: 1, home: 1 }[keyText] ? '' : keyText,
						onPointerDown: (evt) => {
							if(evt.cancelable) evt.preventDefault();

							evt.target.classList.add('active');
						},
						onPointerUp: (evt) => {
							evt.stop();

							evt.target.classList.remove('active');

							var keyText = evt.target[(htpcRemote.keyboard.showAlternates ? 'alternate' : 'key') +'Text'];

							if(htpcRemote.keyboard.modifiers[keyText]) htpcRemote.keyboard.currentModifier = htpcRemote.keyboard.controlKeys[keyText];

							else if(htpcRemote.keyboard.controlKeys[keyText]) socketClient.reply('key', htpcRemote.keyboard.controlKeys[keyText]);

							else if(keyText === 'Alternates') htpcRemote.keyboard.toggleAlternates();

							else{
								if(htpcRemote.keyboard.currentModifier) socketClient.reply('command', { mod: htpcRemote.keyboard.currentModifier, key: keyText });

								else socketClient.reply('type', keyText);
							}

							if(!htpcRemote.keyboard.modifiers[keyText]) delete htpcRemote.keyboard.currentModifier;

							htpcRemote.tactileResponse();
						}
					});

					key.keyText = keyText;
					key.alternateText = htpcRemote.keyboard.layout[x][y].split(':~:')[1] || (keyText.length > 1 ? keyText : keyText.toUpperCase());

					htpcRemote.keyboard.keys.push(key);
				}
			}
		},
		toggleAlternates: function(on){
			if(typeof on === 'undefined') on = !htpcRemote.keyboard.showAlternates;

			if(htpcRemote.keyboard.showAlternates === on) return;

			htpcRemote.keyboard.showAlternates = on;

			for(var x = 0, count = htpcRemote.keyboard.keys.length; x < count; ++x){
				var text = htpcRemote.keyboard.keys[x][(on ? 'alternate' : 'key') +'Text'];

				htpcRemote.keyboard.keys[x].className = text;
				htpcRemote.keyboard.keys[x].textContent = { backspace: 1, left: 1, up: 1, down: 1, right: 1, return: 1, pgUp: 1, pgDown: 1, home: 1 }[text] ? '' : text;
			}
		},
		show: function(){
			dom.show(htpcRemote.keyboard.elem, '', htpcRemote.keyboard.fix);
		},
		hide: function(){
			dom.disappear(htpcRemote.keyboard.elem);
		},
		fix: function(){
			if(!htpcRemote.keyboard.keys.length) return;

			for(var x = 0, xCount = htpcRemote.keyboard.layout.length, index = 0; x < xCount; ++x){
				for(var y = 0, yCount = htpcRemote.keyboard.layout[x].length; y < yCount; ++y){
					htpcRemote.keyboard.keys[index].style.width = ((htpcRemote.keyboard.elem.clientWidth / yCount) - (y + 1 === yCount ? 0 : 1)) +'px';

					++index;
				}
			}
		}
	}
};

dom.onLoad(htpcRemote.load);