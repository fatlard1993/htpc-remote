#!/usr/bin/env bun

import { devConsole, handleExit } from '@vanilla-bean/components/app';
import Argi from 'argi';

import server from './server';

handleExit();

const { options } = new Argi({
	options: {
		port: { type: 'number', alias: 'p', defaultValue: 8793 },
		simulate: { type: 'boolean', description: 'See what would happen, without making any changes', alias: 's' },
	},
});

console.log('Options', options, process.env.NODE_ENV);

await server.init({ port: options.port, simulate: options.simulate });

devConsole();
