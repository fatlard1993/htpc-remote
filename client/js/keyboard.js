// includes dom log
// babel
/* global dom log */

class Keyboard {
	constructor(options = { keyDownLimit: 1, layout: 'simple' }){
		this.elem = dom.createElem('div', { className: 'keyboard disappear', onPointerDown: this.onPointerDown.bind(this), onPointerUp: this.onPointerUp.bind(this) });

		this.events = {};
		this.pointerEvents = {};
		this.keys = {};
		this.keyRows = [];
		this.options = options;

		if(typeof options.keyDefinitions === 'object') this.keyDefinitions = Object.assign(this.keyDefinitions, options.keyDefinitions);
		if(typeof options.layouts === 'object') this.layouts = Object.assign(this.layouts, options.layouts);

		this.fix = this.fix.bind(this);

		this.setupLayout(options.layout);

		dom.maintenance.init([this.fix]);

		return this;
	}

	setupKey(key){
		if(typeof key !== 'string') return;

		var elem = dom.createElem('button');

		if(this.keyDefinitions[key]){
			var name = key;

			elem.classList.add(name);

			key = Object.assign({ name, key: name }, this.keyDefinitions[key]);

			if(key.class) elem.classList.add(typeof key.class === 'object' && key.class.length ? key.class : key.class.split(' '));

			elem.textContent = typeof key.text === 'string' ? key.text : name;
		}

		else {
			elem.textContent = key;
			elem.className = key;

			key = { key };
		}

		key.elem = elem;

		return key;
	}

	setupLayout(layout){
		if(typeof layout !== 'string' || !this.layouts[layout]) return;

		this.layoutName = layout;

		this.elem.className = `keyboard ${layout}`;

		layout = this.layouts[layout];

		this.layout = layout;

		dom.empty(this.elem);

		this.keyRows = [];
		this.keys = {};

		for(var x = 0, xCount = Math.max(layout.length, this.keyRows.length); x < xCount; ++x){
			this.keyRows[x] = this.keyRows[x] || dom.createElem('div', { appendTo: this.elem });

			for(var y = 0, yCount = Math.max(layout[x] && layout[x].length, this.keyRows[x].children.length); y < yCount; ++y){
				var position = `${x}_${y}`;

				var key = this.setupKey(layout[x][y]);

				key.elem.setAttribute('data-pos', position);

				this.keyRows[x].appendChild(key.elem);

				this.keys[position] = key;
			}
		}

		this.show();

		this.fix();
	}

	fix(){
		for(var x = 0, xCount = this.layout.length; x < xCount; ++x){
			for(var y = 0, yCount = this.layout[x].length; y < yCount; ++y){
				if(this.keys[`${x}_${y}`]) this.keys[`${x}_${y}`].elem.style.width = ((this.elem.clientWidth / yCount) - (y + 1 === yCount ? 0 : 1)) +'px';
			}
		}
	}

	onPointerDown(evt){
		if(evt.which && evt.which !== 1) return;

		evt.stop();

		var position = evt.target.getAttribute('data-pos');

		if(!position) return;

		evt.target.classList.add('active');

		evt.id = evt.which || evt.changedTouches[0].identifier;

		evt = Object.assign(evt, this.keys[position]);

		this.pointerEvents[evt.id] = evt;

		this.fire('keyDown', evt);

		clearTimeout(this.keyupTimeout);

		// this.keyupTimeout = setTimeout(this.flushKeyup.bind(this), (this.options.keyDownLimit) * 1000);
	}

	flushKeyup(){
		Object.keys(this.pointerEvents).forEach((id) => {
			this.onPointerUp(this.pointerEvents[id]);
		});
	}

	onPointerUp(evt){
		if(document.activeElement !== document.body) document.activeElement.blur();

		if(evt.which && evt.which !== 1) return;

		evt.stop();

		evt = this.pointerEvents[evt.which || evt.changedTouches[0].identifier];

		if(!evt) return;

		var position = evt.target.getAttribute('data-pos');

		if(!position) return;

		evt.target.classList.remove('active');

		evt = Object.assign(evt, this.keys[position]);

		this.fire('keyUp', evt);

		delete this.pointerEvents[evt.id];
	}

	show(){
		dom.show(this.elem, '', this.fix);
	}

	hide(){
		dom.disappear(this.elem);
	}

	on(name, func){
		this.events[name] = this.events[name] || [];

		this.events[name].push(func);
	}

	fire(name, data){
		if(!this.events[name]) return log.warn(2)(`[Keyboard] No listeners for ${name}`);

		for(var x = this.events[name].length - 1; x >= 0; --x) this.events[name][x].call(this, data);
	}
}

Keyboard.prototype.keyDefinitions = {
	simple: { key: 'simple', text: 'ABC' }
};

Keyboard.prototype.layouts = {
	simple: [
		['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
		['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
		['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
		['space', 'return'],
	],
	numberInput: [
		['1', '2', '3', 'backspace'],
		['4', '5', '6', 'clear'],
		['7', '8', '9', 'done'],
		['.', '0', '-', 'e'],
	]
};