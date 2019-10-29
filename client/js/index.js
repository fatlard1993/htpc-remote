// includes dom log socket-client dialog keyboard js-util
// babel
/* global dom log socketClient dialog Keyboard util */

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
	options: {},
	setOption: function(option, value){
		htpcRemote.options[option] = value;

		dom.storage.set(option, value);
	},
	load: function(){
		htpcRemote.options.rainbowFingers = dom.storage.get('rainbowFingers') === 'true';
		htpcRemote.options.cursorSpeed = parseFloat(dom.storage.get('cursorSpeed'));
		htpcRemote.options.scrollSpeed = parseFloat(dom.storage.get('scrollSpeed'));

		if(!htpcRemote.options.rainbowFingers) htpcRemote.setOption('rainbowFingers', false);
		if(!htpcRemote.options.cursorSpeed) htpcRemote.setOption('cursorSpeed', 1);
		if(!htpcRemote.options.scrollSpeed) htpcRemote.setOption('scrollSpeed', 1);

		htpcRemote.touchPad.init();

		dom.getElemById('wrapper').appendChild(htpcRemote.touchPad.elem);

		htpcRemote.keyboard = new Keyboard({
			keyDefinitions: {
				esc: { key: 'escape', text: 'Esc' },
				backspace: { text: '' },
				tab: { text: '' },
				delete: { text: '' },
				space: { text: '' },
				settings: { text: '' },
				mouse: { text: '' },
				hide: { text: '' },
				lmb: { text: '' },
				rmb: { text: '' },
				home: { text: '' },
				left: { text: '' },
				up: { text: '' },
				down: { text: '' },
				right: { text: '' },
				end: { text: 'End' },
				shift: { class: 'mod', text: '' },
				fakeShift: { class: 'shift', text: '' },
				ctrl: { key: 'control', text: 'Ctrl', class: 'mod' },
				os: { key: 'command', class: 'mod os', text: '' },
				alt: { class: 'mod', text: 'Alt' },
				return: { key: 'enter', class: 'return', text: '' },
				pgUp: { key: 'pageup', text: '' },
				pgDown: { key: 'pagedown', text: '' },
				volUp: { key: 'audio_vol_up', text: '' },
				volDown: { key: 'audio_vol_down', text: '' },
				volMute: { key: 'audio_mute', text: '' },
				play: { key: 'audio_play', text: '' },
				pause: { key: 'audio_pause', text: '' },
				stop: { key: 'audio_stop', text: '' },
				next: { key: 'audio_next', text: '' },
				prev: { key: 'audio_prev', text: '' },
				keyboard: { key: 'basic', class: 'keyboard', text: '' },
				'!': { mod: 'shift', key: '1' },
				'@': { mod: 'shift', key: '2' },
				'#': { mod: 'shift', key: '3' },
				'$': { mod: 'shift', key: '4' },
				'%': { mod: 'shift', key: '5' },
				'^': { mod: 'shift', key: '6' },
				'&': { mod: 'shift', key: '7' },
				'*': { mod: 'shift', key: '8' },
				'(': { mod: 'shift', key: '9' },
				')': { mod: 'shift', key: '0' },
				'~': { mod: 'shift', key: '`' },
				'_': { mod: 'shift', key: '-' },
				'+': { mod: 'shift', key: '=' },
				'{': { mod: 'shift', key: '[' },
				'}': { mod: 'shift', key: ']' },
				'|': { mod: 'shift', key: '\\' },
				':': { mod: 'shift', key: ';' },
				'"': { mod: 'shift', key: `'` },
				'<': { mod: 'shift', key: ',' },
				'>': { mod: 'shift', key: '.' },
				'?': { mod: 'shift', key: '/' },
				'Q': { mod: 'shift', key: 'q' },
				'W': { mod: 'shift', key: 'w' },
				'E': { mod: 'shift', key: 'e' },
				'R': { mod: 'shift', key: 'r' },
				'T': { mod: 'shift', key: 't' },
				'Y': { mod: 'shift', key: 'y' },
				'U': { mod: 'shift', key: 'u' },
				'I': { mod: 'shift', key: 'i' },
				'O': { mod: 'shift', key: 'o' },
				'P': { mod: 'shift', key: 'p' },
				'A': { mod: 'shift', key: 'a' },
				'S': { mod: 'shift', key: 's' },
				'D': { mod: 'shift', key: 'd' },
				'F': { mod: 'shift', key: 'f' },
				'G': { mod: 'shift', key: 'g' },
				'H': { mod: 'shift', key: 'h' },
				'J': { mod: 'shift', key: 'j' },
				'K': { mod: 'shift', key: 'k' },
				'L': { mod: 'shift', key: 'l' },
				'Z': { mod: 'shift', key: 'z' },
				'X': { mod: 'shift', key: 'x' },
				'C': { mod: 'shift', key: 'c' },
				'V': { mod: 'shift', key: 'v' },
				'B': { mod: 'shift', key: 'b' },
				'N': { mod: 'shift', key: 'n' },
				'M': { mod: 'shift', key: 'm' }
			},
			layouts: {
				full: [
					['media', 'numpad', 'basic', 'full', 'mouse', 'hide'],
					['esc', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f8', 'f9', 'f10', 'f11', 'f12', 'delete'],
					['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
					['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
					['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', `'`, 'return'],
					['fakeShift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
					['ctrl', 'os', 'alt', 'space', 'left', 'up', 'down', 'right']
				],
				fullFakeShift: [
					['media', 'numpad', 'basic', 'full', 'mouse', 'hide'],
					['esc', 'volMute', 'volDown', 'volUp', 'prev', 'play', 'pause', 'next', 'settings', 'f8', 'f9', 'f10', 'f11', 'f12', 'delete'],
					['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', 'backspace'],
					['tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'],
					['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', 'return'],
					['fakeShift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', 'shift'],
					['ctrl', 'os', 'alt', 'space', 'home', 'pgUp', 'pgDown', 'end']
				],
				basic: [
					['media', 'numpad', 'basic', 'full', 'mouse', 'hide'],
					['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
					['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
					['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
					['fakeShift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
					['os', 'space', 'ctrl'],
					['left', 'up', 'down', 'right']
				],
				basicFakeShift: [
					['media', 'numpad', 'basic', 'full', 'mouse', 'hide'],
					['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
					['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
					['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
					['fakeShift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'backspace'],
					['os', 'space', 'ctrl'],
					['left', 'up', 'down', 'right']
				],
				numpad: [
					['media', 'numpad', 'basic', 'full', 'mouse', 'hide'],
					['1', '2', '3', 'backspace', 'delete'],
					['4', '5', '6', '+', '-'],
					['7', '8', '9', '*', '/'],
					['.', '0', ',', 'tab', 'return'],
					['left', 'up', 'down', 'right']
				],
				media: [
					['media', 'numpad', 'basic', 'full', 'mouse', 'hide'],
					['esc', 'volMute', 'volDown', 'volUp'],
					['play', 'pause', 'prev', 'next'],
					['f', 'space', 'f11']
				],
				everything: [
					['esc', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f8', 'f9', 'f10', 'f11', 'f12'],
					['volMute', 'volDown', 'volUp', 'prev', 'play', 'pause', 'next', ':', '"', '<', '>', '?'],
					['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'delete'],
					['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', 'backspace'],
					['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
					['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', `'`, 'return'],
					['fakeShift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
					['ctrl', 'os', 'alt', 'space', 'left', 'up', 'down', 'right']
				],
				'abc1': [
					['hide', 'ABC!', 'numbers', 'symbols', 'full', 'mouse'],
					['esc', 'tab', 'delete', 'settings'],
					['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
					['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
					['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
					['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
					['os', 'space', 'return'],
					['ctrl', 'alt', 'left', 'up', 'down', 'right']
				],
				'ABC!': [
					['abc1', 'hide', 'numbers', 'symbols', 'full', 'mouse'],
					['esc', 'tab', 'delete', 'settings'],
					['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
					['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
					['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
					['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'backspace'],
					['os', 'space', 'return'],
					['ctrl', 'alt', 'home', 'pgUp', 'pgDown', 'end']
				],
				symbols: [
					['abc1', 'ABC!', 'numbers', 'hide', 'full', 'mouse'],
					['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
					['`', '[', ']', '\\', ';', '\'', ',', '.', '/', '-', '='],
					['~', '{', '}', '|', ':', '"', '<', '>', '?', '_', '+'],
					['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', 'backspace'],
					['delete', 'space', 'return'],
					['tab', 'left', 'up', 'down', 'right']
				],
				numbers: [
					['abc1', 'ABC!', 'hide', 'symbols', 'full', 'mouse'],
					['1', '2', '3', 'backspace'],
					['4', '5', '6', 'delete'],
					['7', '8', '9', '.'],
					['.', '0', '+', '-'],
					['tab', 'space', 'return'],
					['tab', 'left', 'up', 'down', 'right']
				],
				mouse: [
					['lmb', 'rmb'],
					['up', 'keyboard', 'down'],
					['home', 'pgUp', 'pgDown', 'end']
				],
				hide: [
					['keyboard']
				]
			},
			layout: 'hide'
		});

		window.onbeforeunload = htpcRemote.keyboard.flushKeyup.bind(htpcRemote.keyboard);

		htpcRemote.keyboard.on('keyDown', (evt) => {
			htpcRemote.tactileResponse();

			if(htpcRemote.keyboard.layouts[evt.key]) return;

			if(htpcRemote.activeInput) return;

			if({ lmb: 1, rmb: 1 }[evt.key]) socketClient.reply('mouseDown', evt.key === 'rmb' ? 'right' : 'left');

			else if({ fakeShift: 1, settings: 1 }[evt.key]) return;

			else if(evt.key) socketClient.reply('keyDown', evt);
		});

		htpcRemote.keyboard.on('keyUp', (evt) => {
			if(htpcRemote.keyboard.layouts[evt.key]) htpcRemote.keyboard.setupLayout(evt.key);

			else if(evt.key === 'settings'){
				htpcRemote.keyboard.hide();

				var settingsWrapper = dom.createElem('div');
				var rainbowFingers = dom.createElem('input', { type: 'checkbox', checked: htpcRemote.options.rainbowFingers, appendTo: dom.createElem('label', { textContent: 'Rainbow Fingers', appendTo: settingsWrapper }) });
				var cursorSpeed = dom.createElem('input', { readOnly: true, className: 'input number', validation: /^[0-9][0-9]?$/, validationWarning: 'Must be a valid number between 0 and 99', value: dom.storage.get('cursorSpeed'), appendTo: dom.createElem('label', { textContent: 'Cursor Speed', appendTo: settingsWrapper }) });
				var scrollSpeed = dom.createElem('input', { readOnly: true, className: 'input number', validation: /^[0-9][0-9]?$/, validationWarning: 'Must be a valid number between 0 and 99', value: dom.storage.get('scrollSpeed'), appendTo: dom.createElem('label', { textContent: 'Scroll Speed', appendTo: settingsWrapper }) });

				dialog('settings', 'Settings', settingsWrapper, 2);

				dialog.resolve.settings = function(choice){
					htpcRemote.keyboard.setupLayout('hide');

					if(choice === 'Cancel') return;

					htpcRemote.setOption('rainbowFingers', rainbowFingers.checked);
					htpcRemote.setOption('cursorSpeed', parseFloat(cursorSpeed.value) || 5);
					htpcRemote.setOption('scrollSpeed', parseFloat(scrollSpeed.value) || 1);
				};
			}

			else if({ lmb: 1, rmb: 1 }[evt.key]) socketClient.reply('mouseUp', evt.key === 'rmb' ? 'right' : 'left');

			else if(evt.key === 'fakeShift'){
				if(htpcRemote.keyboard.layoutName.startsWith('basic')) htpcRemote.keyboard.setupLayout(htpcRemote.keyboard.layoutName === 'basic' ? 'basicFakeShift' : 'basic');

				else htpcRemote.keyboard.setupLayout(htpcRemote.keyboard.layoutName === 'full' ? 'fullFakeShift' : 'full');
			}

			else if(htpcRemote.activeInput){
				if(evt.key === 'BackSpace') htpcRemote.activeInput.value = htpcRemote.activeInput.value.slice(0, -1);

				else if(evt.key === 'clear') htpcRemote.activeInput.value = '';

				else htpcRemote.activeInput.value += evt.key.length > 1 ? evt.target.textContent : evt.key;
			}

			else if(evt.key){
				socketClient.reply('keyUp', evt);

				if(htpcRemote.keyboard.layoutName === 'basicFakeShift') htpcRemote.keyboard.setupLayout('basic');
				else if(htpcRemote.keyboard.layoutName === 'fullFakeShift') htpcRemote.keyboard.setupLayout('full');
			}
		});

		dom.getElemById('wrapper').appendChild(htpcRemote.keyboard.elem);

		socketClient.init();

		dom.mobile.detect();

		dom.interact.on('pointerDown', socketClient.stayConnected);

		dom.interact.on('pointerUp', (evt) => {
			if(evt.target.classList.contains('input') && evt.target.classList.contains('number')){
				evt.stop();

				if(document.getElementsByClassName('active')[0]) document.getElementsByClassName('active')[0].classList.remove('active');

				evt.target.classList.add('active');

				htpcRemote.activeInput = evt.target;

				htpcRemote.keyboard.setupLayout('numberInput');
			}
		});

		document.addEventListener('visibilitychange', () => {
			if(document.visibilityState) socketClient.stayConnected();

			else htpcRemote.keyboard.flushKeyup();
		});
	},
	tactileResponse: function(){
		if(!navigator.vibrate) return;

		navigator.vibrate(20);
	},
	touchPad: {
		init: function(){
			document.oncontextmenu = (evt) => { evt.preventDefault();	};

			htpcRemote.touchPad.elem = dom.createElem('div', { id: 'touchPad', onPointerDown: htpcRemote.touchPad.touchStart, onPointerUp: htpcRemote.touchPad.touchEnd });

			// htpcRemote.touchPad.updatePointer({ which: '1', clientX: 100, clientY: 100 })
		},
		getPositionDifference: function(position1, position2){
			return {
				x: Math.round(position1.x - position2.x),
				y: Math.round(position1.y - position2.y)
			};
		},
		getCursorDistance: function(position){
			return {
				x: position.x * htpcRemote.options.cursorSpeed,
				y: position.y * htpcRemote.options.cursorSpeed
			};
		},
		getScrollDistance: function(position){
			return {
				x: (position.x * htpcRemote.options.scrollSpeed) / 4,
				y: (position.y * htpcRemote.options.scrollSpeed) / 4
			};
		},
		pointers: {},
		updatePointer: function(evt){
			var id = evt.changedTouches ? evt.changedTouches[0].identifier : evt.which;

			if(typeof id === 'undefined') return;

			if(!htpcRemote.touchPad.pointers[id]){
				htpcRemote.touchPad.pointers[id] = {};
				htpcRemote.touchPad.pointers[id].elem = dom.createElem('div', { className: 'pointer', appendTo: htpcRemote.touchPad.elem });

				if(htpcRemote.options.rainbowFingers) htpcRemote.touchPad.pointers[id].elem.style.backgroundColor = util.randColor();
			}

			var pointerPosition = dom.resolvePosition(evt);
			var radiusX = evt.changedTouches ? evt.changedTouches[0].radiusX : 32;
			var radiusY = evt.changedTouches ? evt.changedTouches[0].radiusY : 32;

			dom.setTransform(htpcRemote.touchPad.pointers[id].elem, `translateX(${pointerPosition.x - ((radiusX / 2) + 3)}px) translateY(${pointerPosition.y - ((radiusY / 2) + 3)}px)`);

			htpcRemote.touchPad.pointers[id].position = pointerPosition;
			htpcRemote.touchPad.pointers[id].elem.style.width = radiusX +'px';
			htpcRemote.touchPad.pointers[id].elem.style.height = radiusY +'px';
		},
		touchStart: function(evt){
			evt.preventDefault();

			htpcRemote.touchPad.pointerCount = evt.targetTouches ? evt.targetTouches.length : 1;

			if(!htpcRemote.touchPad.started){
				document.addEventListener('touchmove', htpcRemote.touchPad.touchMove);
				document.addEventListener('mousemove', htpcRemote.touchPad.touchMove);
			}

			htpcRemote.touchPad.started = true;

			htpcRemote.touchPad.updatePointer(evt);
		},
		touchMove: function(evt){
			if(evt.cancelable) evt.preventDefault();

			var thisMoveTime = performance.now();

			htpcRemote.touchPad.pointerCount = evt.targetTouches ? evt.targetTouches.length : 1;

			var id = evt.changedTouches ? evt.changedTouches[0].identifier : evt.which;

			if(!htpcRemote.touchPad.pointers[id] || thisMoveTime - htpcRemote.touchPad.pointers[id].lastMoveTime < 40) return;

			htpcRemote.touchPad.pointers[id].lastMoveTime = thisMoveTime;

			var newPosition = dom.resolvePosition(evt);

			if(!htpcRemote.touchPad.pointers[id].lastPosition) htpcRemote.touchPad.pointers[id].lastPosition = newPosition;

			var positionDifference = htpcRemote.touchPad.getPositionDifference(newPosition, htpcRemote.touchPad.pointers[id].lastPosition);

			positionDifference = htpcRemote.touchPad.pointerCount === 2 ? htpcRemote.touchPad.getScrollDistance(positionDifference) : htpcRemote.touchPad.getCursorDistance(positionDifference);

			if(Math.abs(positionDifference.x) < 1 || Math.abs(positionDifference.y) < 1) return;

			if(htpcRemote.touchPad.pointerCount < 3) socketClient.reply(htpcRemote.touchPad.pointerCount === 2 ? 'touchPadScroll' : 'touchPadMove', positionDifference);

			htpcRemote.touchPad.updatePointer(evt);

			htpcRemote.touchPad.pointers[id].lastPosition = newPosition;
			htpcRemote.touchPad.moved = true;
		},
		touchEnd: function(evt){
			if(!htpcRemote.touchPad.started) return;

			evt.preventDefault();

			var id = evt.changedTouches ? evt.changedTouches[0].identifier : evt.which;

			if(htpcRemote.touchPad.pointers[id]){
				dom.remove(htpcRemote.touchPad.pointers[id].elem);

				delete htpcRemote.touchPad.pointers[id];
			}

			if(evt.targetTouches && evt.targetTouches.length) return;

			if(!htpcRemote.touchPad.moved){
				htpcRemote.tactileResponse();

				if(htpcRemote.touchPad.pointerCount < 4){
					if(htpcRemote.touchPad.pointerCount === 3){
						if(htpcRemote.keyboard.layoutName !== 'hide') htpcRemote.keyboard.setupLayout('hide');

						else htpcRemote.keyboard.setupLayout('basic');
					}

					else socketClient.reply('click', htpcRemote.touchPad.pointerCount === 2 || evt.which === 2 ? 'right' : 'left');
				}
			}

			delete htpcRemote.touchPad.pointerCount;
			delete htpcRemote.touchPad.started;
			delete htpcRemote.touchPad.moved;

			document.removeEventListener('touchmove', htpcRemote.touchPad.touchMove);
			document.removeEventListener('mousemove', htpcRemote.touchPad.touchMove);
		}
	}
};

dom.onLoad(htpcRemote.load);