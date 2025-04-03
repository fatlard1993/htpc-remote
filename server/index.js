#!/usr/bin/env bun

import Argi from 'argi';

import server, { spawnBuild } from './server';

import './exit';

const { options } = new Argi({
	options: {
		port: { type: 'number', alias: 'p', defaultValue: 8793 },
		simulate: { type: 'boolean', description: 'See what would happen, without making any changes', alias: 's' },
	},
});

console.log('Options', options, process.env.NODE_ENV);

server.init({ port: options.port, simulate: options.simulate });

for await (const line of console) {
	if (line === 'b') {
		console.log('>> Building...');
		spawnBuild();
	}
}
