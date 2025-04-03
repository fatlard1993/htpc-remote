// eslint-disable-next-line prefer-const
let maxRetries = 3;
let socket;
const messageListeners = [];

const connect = async () => {
	return new Promise(resolve => {
		socket = new WebSocket(`ws://${window.location.host}/ws`);

		socket.addEventListener('open', () => {
			resolve();
		});

		socket.addEventListener('message', event => {
			if (process.env.NODE_ENV === 'development' && event.data === 'hotReload') window.location.reload();
			else messageListeners.forEach(listener => listener(event));
		});

		socket.addEventListener('error', error => {
			console.error('WS Error:', error);

			socket.close();
		});
	});
};

const send = async (message, payload = {}, attempt = 0) => {
	// console.log(message, payload)
	try {
		if (socket.readyState === 3) {
			await connect();

			await send(message, payload, ++attempt);
		} else socket.send(JSON.stringify({ message, payload }));
	} catch (error) {
		if (attempt >= maxRetries) return console.error('failed to send', { error, socket });

		await connect();

		await send(message, payload, ++attempt);
	}
};

const onMessage = callback => {
	messageListeners.push(event => {
		let data;

		try {
			data = JSON.parse(event.data);
		} catch {
			data = { message: event.data };
		}

		callback({ ...event, ...data });
	});
};

await connect();

export default { ...socket, maxRetries, connect, send, onMessage };
