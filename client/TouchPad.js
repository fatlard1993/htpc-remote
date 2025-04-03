import { Component, throttle, tactileResponse, convertRange, rootContext } from 'vanilla-bean-components';
import socket from './socket';

export default class TouchPad extends Component {
	constructor(options = {}) {
		super({
			...options,
			cursorSpeed: 1,
			scrollSpeed: 2,
			styles: ({ colors }) => `
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				touch-action: none;
				background-size: 16px 16px !important;
				background-color: ${colors.darker(colors.gray)};
				background-image: linear-gradient(to right, ${colors.darkest(
					colors.gray,
				)} 1px, transparent 1px), linear-gradient(to bottom, ${colors.darkest(
					colors.gray,
				)} 1px, transparent 1px) !important;

				div.pointer {
					position: absolute;
					pointer-events: none;
					background-color: $teal-dark;
					border: 3px double $black;
					opacity: 0.3;
					border-radius: 50%;
					z-index: 99999;
					will-change: transform;
				}
			`,
		});

		this.pointers = {};

		this.elem.addEventListener('pointerdown', this.cursorInit.bind(this));
	}

	getPosition({ offsetX, offsetY }) {
		return { x: offsetX, y: offsetY };
	}

	getPositionDelta(position1, position2, speed = 1) {
		return {
			x: Math.round(position1.x - position2.x) * speed,
			y: Math.round(position1.y - position2.y) * speed,
		};
	}

	cursorInit(event) {
		event.preventDefault();

		const { pointerId } = event;

		if (!this.pointers[pointerId]) this.pointers[pointerId] = {};

		this.pointers[pointerId].position = this.getPosition(event);

		this.activePointerCount = Object.values(this.pointers).filter(_ => !!_).length;
		this.maxPointerCount = Math.max(this.activePointerCount, this.maxPointerCount ?? 0);

		if (this.pointerInteracting) return;

		this.pointerInteracting = true;
		this.pointers[pointerId].initiator = true;

		const move = throttle(this.cursorMove.bind(this), 20);
		const removePointer = event => {
			event.preventDefault();

			if (!this.pointers[event.pointerId]) return;

			delete this.pointers[event.pointerId];

			this.activePointerCount = Object.values(this.pointers).filter(_ => !!_).length;

			if (this.activePointerCount === 0) {
				this.cursorEnd.bind(this)(event);

				document.removeEventListener('pointermove', move);
				document.removeEventListener('pointerup', removePointer);
				document.removeEventListener('pointerleave', removePointer);
				document.removeEventListener('pointercancel', removePointer);
			}
		};

		document.addEventListener('pointermove', move);
		document.addEventListener('pointerup', removePointer);
		document.addEventListener('pointerleave', removePointer);
		document.addEventListener('pointercancel', removePointer);
	}

	cursorMove(event) {
		event.preventDefault();

		const { pointerId } = event;

		if (!this.pointers[pointerId] || !this.pointers[pointerId].initiator || this.activePointerCount > 2) return;

		const newPosition = this.getPosition(event);

		if (!this.pointers[pointerId].lastPosition) {
			this.pointers[pointerId].lastPosition = newPosition;

			return;
		}

		const positionDelta = this.getPositionDelta(
			newPosition,
			this.pointers[pointerId].lastPosition,
			this.activePointerCount === 2 ? this.options.scrollSpeed : this.options.cursorSpeed,
		);

		if (Math.abs(positionDelta.x) < 1 || Math.abs(positionDelta.y) < 1) return;

		const thisMoveTime = performance.now();
		const timeDelta = thisMoveTime - this.pointers[pointerId].lastMoveTime || 0;

		const timeModifier = Math.max(1, Math.min(4, convertRange(timeDelta, [150, 20], [1, 4])));

		console.log(timeModifier);

		positionDelta.x *= timeModifier;
		positionDelta.y *= timeModifier;

		positionDelta.x = Math.floor(positionDelta.x);
		positionDelta.y = Math.floor(positionDelta.y);

		socket.send(this.activePointerCount === 2 ? 'scroll' : 'mouseMove', positionDelta);

		this.pointers[pointerId].lastPosition = this.pointers[pointerId].position;
		this.pointers[pointerId].position = newPosition;
		this.pointers[pointerId].lastMoveTime = thisMoveTime;

		this.pointerMoved = true;
	}

	cursorEnd() {
		if (!this.pointerMoved && this.maxPointerCount < 4) {
			tactileResponse();

			if (this.maxPointerCount === 3 && rootContext.keyboard.layout !== 'hide') rootContext.keyboard.setLayout('hide');
			else socket.send('click', { button: this.maxPointerCount === 2 ? 'right' : 'left' });
		}

		this.pointerInteracting = false;
		this.pointerMoved = false;
		this.maxPointerCount = 0;
	}
}
