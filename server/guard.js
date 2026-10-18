import { hostname } from 'os';

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;
const machine = hostname().split('.')[0].toLowerCase();

const hostOf = header => {
	const host = String(header ?? '').toLowerCase();

	if (host.startsWith('[')) return host.slice(0, host.indexOf(']') + 1);

	return host.split(':')[0];
};

// A name for this machine: an address, localhost, or its own hostname under any local suffix (htpc, htpc.local, htpc.lan).
// A rebound DNS name (a site's own domain pointed at this address) is none of these.
export const foreignHost = request => {
	const host = hostOf(request.headers.get('host'));

	if (IPV4.test(host) || host.startsWith('[') || host === 'localhost') return false;

	return host.split('.')[0] !== machine;
};

// Runs a socket message's control, if it names one: malformed messages and anything that isn't control's own
// function (__proto__, constructor, heldKeys) are dropped
export const handleMessage = (control, buffer, { simulate } = {}) => {
	let parsed;

	try {
		parsed = JSON.parse(buffer);
	} catch {
		return false;
	}

	const { message, payload = {} } = parsed ?? {};

	if (typeof message !== 'string' || !Object.hasOwn(control, message) || typeof control[message] !== 'function') {
		return false;
	}

	console.log({ message, payload });

	if (simulate) {
		console.log('SIMULATE', { message, payload });

		return true;
	}

	try {
		control[message](payload);
	} catch (error) {
		console.error(error);
	}

	return true;
};
