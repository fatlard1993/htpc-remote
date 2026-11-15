import { Notify, connectSocket } from '@vanilla-bean/components';

// While the connection is down a press goes nowhere (nothing is queued), so the remote says so until it's back
let lost = null;

const socket = connectSocket('/ws', {
	onLost: () => {
		lost ??= new Notify({
			intent: 'warning',
			content: "Lost the connection: presses won't reach the computer until it's back",
			anchor: false,
			onClose: () => (lost = null),
		});
	},
	onRestored: () => {
		lost?.close();
		lost = null;
	},
});

const send = (message, payload = {}) => socket.send({ message, payload });

export default { send };
