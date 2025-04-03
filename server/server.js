import control from './control';
import router from './router';

const clients = {};

export const reloadClients = () => {
	Object.entries(clients).forEach(([clientId, socket]) => {
		console.log(`Reloading ${clientId}`);

		socket.send('hotReload');
	});
};

export const spawnBuild = async () => {
	const buildProcess = Bun.spawn(['bun', 'run', 'build:watch']);

	for await (const chunk of buildProcess.stdout) {
		const line = new TextDecoder().decode(chunk);

		console.log(line);

		if (line === 'build.success\n') reloadClients();
	}
};

export default {
	clients,
	async init({ port, simulate }) {
		const server = Bun.serve({
			port,
			fetch: router,
			websocket: {
				open(socket) {
					clients[socket.data.clientId] = socket;
				},
				close(socket) {
					delete clients[socket.data.clientId];
				},
				message(socket, buffer) {
					const { message, payload } = JSON.parse(buffer);

					console.log({ message, payload });

					if (simulate) console.log('SIMULATE', { message, payload });
					else if (control[message]) {
						try {
							control[message](payload);
						} catch (error) {
							console.error(error);
						}
					}
				},
			},
		});

		console.log(`Listening on ${server.hostname}:${server.port}`);

		if (process.env.NODE_ENV === 'development') {
			await spawnBuild();
		}
	},
};
