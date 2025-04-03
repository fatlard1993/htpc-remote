import robot from '@jitsi/robotjs';

const control = {
	heldKeys: {},
	mouseMove: ({ x, y }) => {
		const currentPosition = robot.getMousePos();

		robot.moveMouse(currentPosition.x + x, currentPosition.y + y);
	},
	scroll: ({ x, y }) => {
		robot.scrollMouse(x, y);
	},
	type: ({ text }) => {
		robot.typeString(text);
	},
	keyHold: ({ mod }) => {
		control.heldKeys[mod] = true;
	},
	keyPress: ({ key, mod = [] }) => {
		robot.keyTap(key, mod);
	},
	keyDown: ({ key, mod }) => {
		robot.keyToggle(key, 'down', mod);
	},
	keyUp: ({ key, mod }) => {
		robot.keyToggle(key, 'up', mod);
	},
	mouseDown: ({ button }) => {
		robot.mouseToggle('down', button);
	},
	mouseUp: ({ button }) => {
		robot.mouseToggle('up', button);
	},
	click: ({ button, double }) => {
		robot.mouseClick(button, double);
	},
};

export default control;
