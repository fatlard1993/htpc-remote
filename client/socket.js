import { connectSocket } from '@vanilla-bean/components';

const socket = connectSocket('/ws');

const send = (message, payload = {}) => socket.send({ message, payload });

export default { send };
