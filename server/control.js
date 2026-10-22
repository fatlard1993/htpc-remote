import robot from '@jitsi/robotjs';

const control = {
	mouseMove: ({ x, y }) => {
		const currentPosition = robot.getMousePos();

		robot.moveMouse(currentPosition.x + x, currentPosition.y + y);
	},
	scroll: ({ x, y }) => {
		robot.scrollMouse(x, y);
	},
	keyPress: ({ key, mod = [] }) => {
		robot.keyTap(key, mod);
	},
	click: ({ button, double = false }) => {
		robot.mouseClick(button, double);
	},
};

export default control;
