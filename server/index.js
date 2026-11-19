#!/usr/bin/env bun

import { devConsole, handleExit } from '@vanilla-bean/components/app';
import Argi from 'argi-cli';

import server from './server';

handleExit();

const { options } = new Argi({
	options: {
		port: { type: 'number', alias: 'p', defaultValue: 8793 },
		names: {
			type: 'csv',
			alias: 'n',
			description: 'Other names the page answers to, such as a reverse proxy serves it under',
		},
		simulate: { type: 'boolean', description: 'See what would happen, without making any changes', alias: 's' },
	},
});

if (process.env.NODE_ENV === 'development') console.log('Options', options);

await server.init({ port: options.port, names: options.names, simulate: options.simulate });

devConsole();
