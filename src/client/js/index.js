import Log from 'log';
import util from 'js-util';
import dom from 'dom';
import dialog from 'dialog';
import socketClient from '_socket';
import '_keyboard';

const log = new Log({ verbosity: parseInt(dom.storage.get('logVerbosity') || 0) });

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
		htpcRemote.keyboard.init();

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

				htpcRemote.keyboard.setLayout('numberInput');
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
			htpcRemote.touchPad.elem = dom.getElemById('touchPad');

			dom.onPointerDown(htpcRemote.touchPad.elem, htpcRemote.touchPad.touchStart);
			dom.onPointerUp(htpcRemote.touchPad.elem, htpcRemote.touchPad.touchEnd);
			// htpcRemote.touchPad.elem = dom.createElem('div', { id: 'touchPad', onPointerDown: htpcRemote.touchPad.touchStart, onPointerUp: htpcRemote.touchPad.touchEnd });

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

			if(!htpcRemote.touchPad.pointers[id] || thisMoveTime - htpcRemote.touchPad.pointers[id].lastMoveTime < 20) return;

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
						if(htpcRemote.keyboard.layout !== 'hide') htpcRemote.keyboard.setLayout('hide');

						else htpcRemote.keyboard.setLayout('basic');
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
	},
	keyboard: {
		modTimeouts: {},
		init: function(){
			htpcRemote.keyboard.elem = dom.getElemById('keyboard');

			window.addEventListener('beforeunload', () => {
				htpcRemote.keyboard.elem.flushKeyup();

				Array.from(htpcRemote.keyboard.elem.getElementsByClassName('pressed')).forEach((key) => {
					var position = key.getAttribute('data-pos');

					if(!position) return;

					htpcRemote.keyboard.onKeyUp({ detail: Object.assign({ elem: key }, htpcRemote.keyboard.elem.keys[position]) });
				});
			});

			htpcRemote.keyboard.elem.on('keyDown', htpcRemote.keyboard.onKeyDown);
			htpcRemote.keyboard.elem.on('keyUp', htpcRemote.keyboard.onKeyUp);
		},
		onKeyDown: function(evt){
			var key = evt.detail.key;

			htpcRemote.tactileResponse();

			if(this.layouts[key]) return;

			if(htpcRemote.activeInput) return;

			// todo if key is pressed send keyup
			if(evt.detail.elem.classList.contains('pressed')) return evt.detail.elem.classList.remove('pressed');

			if(evt.detail.elem.classList.contains('mod')){
				htpcRemote.keyboard.modTimeouts[key] = setTimeout(() => {
					log()('key held', key);

					// todo set key to pressed
					evt.detail.elem.classList.add('pressed');
				}, 800);
			}

			if({ lmb: 1, rmb: 1 }[key]) socketClient.reply('mouseDown', key === 'rmb' ? 'right' : 'left');

			else if({ fakeShift: 1, settings: 1 }[key]) return;

			else if(key) socketClient.reply('keyDown', evt.detail);
		},
		onKeyUp: function(evt){
			var key = evt.detail.key;

			if(htpcRemote.keyboard.modTimeouts[key]) clearTimeout(htpcRemote.keyboard.modTimeouts[key]);

			// todo if key is pressed ignore keyup
			if(evt.detail.elem.classList.contains('pressed')) return;

			if(this.layouts[key]) this.setLayout(key);

			else if(key === 'settings'){
				this.hide();

				var settingsWrapper = dom.createElem('div');
				var rainbowFingers = dom.createElem('input', {
					type: 'checkbox',
					checked: htpcRemote.options.rainbowFingers,
					appendTo: dom.createElem('label', { textContent: 'Rainbow Fingers', appendTo: settingsWrapper })
				});
				var cursorSpeed = dom.createElem('input', {
					readOnly: true,
					className: 'input number',
					validation: /^[0-9][0-9]?$/,
					validationWarning: 'Must be a valid number between 0 and 99',
					value: dom.storage.get('cursorSpeed'),
					appendTo: dom.createElem('label', { textContent: 'Cursor Speed', appendTo: settingsWrapper })
				});
				var scrollSpeed = dom.createElem('input', {
					readOnly: true,
					className: 'input number',
					validation: /^[0-9][0-9]?$/,
					validationWarning: 'Must be a valid number between 0 and 99',
					value: dom.storage.get('scrollSpeed'),
					appendTo: dom.createElem('label', { textContent: 'Scroll Speed', appendTo: settingsWrapper })
				});

				dialog('settings', 'Settings', settingsWrapper, 2);

				dialog.resolve.settings = function(choice){
					this.setLayout('hide');

					if(choice === 'Cancel') return;

					htpcRemote.setOption('rainbowFingers', rainbowFingers.checked);
					htpcRemote.setOption('cursorSpeed', parseFloat(cursorSpeed.value) || 5);
					htpcRemote.setOption('scrollSpeed', parseFloat(scrollSpeed.value) || 1);
				};
			}

			else if({ lmb: 1, rmb: 1 }[key]) socketClient.reply('mouseUp', key === 'rmb' ? 'right' : 'left');

			else if(key === 'fakeShift'){
				if(this.layout.startsWith('basic')) this.setLayout(this.layout === 'basic' ? 'basicFakeShift' : 'basic');

				else this.setLayout(this.layout === 'full' ? 'fullFakeShift' : 'full');
			}

			else if(htpcRemote.activeInput){
				if(key === 'BackSpace') htpcRemote.activeInput.value = htpcRemote.activeInput.value.slice(0, -1);

				else if(key === 'clear') htpcRemote.activeInput.value = '';

				else htpcRemote.activeInput.value += key.length > 1 ? evt.detail.elem.textContent : key;
			}

			else if(key){
				socketClient.reply('keyUp', evt.detail);

				if(this.layout === 'basicFakeShift') this.setLayout('basic');
				else if(this.layout === 'fullFakeShift') this.setLayout('full');
			}
		}
	}
};

dom.onLoad(htpcRemote.load);

document.oncontextmenu = (evt) => { evt.preventDefault();	};