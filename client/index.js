import { Page, requestWakeLock } from '@vanilla-bean/components';

import View from './View';

import '@vanilla-bean/components/app/reloadOnBuild';

import './socket';

new Page({ appendTo: document.body, content: [new View()] });

// A remote in hand shouldn't go dark between presses
requestWakeLock();
